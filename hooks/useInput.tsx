"use client"

import { IS_REQUIRED, ValidationFn, validationUtils, Validity } from "@/lib/validation"
import { useCallback, useMemo, useState } from "react";

export type UseInputReturn = {
  name: string,
  value: string | number | boolean,
  errors: string[],
  isRequired: boolean,
  touched: boolean,
  blurred: boolean,
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void,
  onBlur: () => void,
  onReset: () => void,
}

// Interface for input changes and blurs
interface InputCondition {
  touched: boolean,
  blurred: boolean,
};

// External interface that allows props to be undefined
export interface UseInputOptionsInput {
  enforceValidation?: boolean,
  required?: boolean,
  dependencies?: string[],
}

// Internal type that require all props
type UseInputOptions = Required<UseInputOptionsInput>;

export default function useInput(
  initName: string = "", 
  initValue: string | boolean | number = "",
  initValidation: ValidationFn[] =[],
  initOptions: UseInputOptionsInput = {}
): UseInputReturn {
  // Check if name contains trailing asterisk
  const { name, isRequired } = validationUtils.removeAsterisk(initName);
  // Update validationFns
  const validation: ValidationFn[] = useMemo((): ValidationFn[] => {
    if (isRequired) return [...initValidation, IS_REQUIRED];
    return [...initValidation];
  }, [initValidation, isRequired]);

  // Update input options
  const options: UseInputOptions = useMemo((): UseInputOptions => {
    return {
      enforceValidation: false,
      dependencies: [],
      required: isRequired,
      ...initOptions,
    }
  }, [initOptions, isRequired]);
  
  // prevValue saves the last valid value in case it must be reverted
  const [ prevValue, setPrevValue ] = useState<string | number | boolean>(initValue);
  const [ value, setValue ] = useState<string | number | boolean>(initValue);
  const [ errors, setErrors ] = useState<string[]>([]);
  const [ condition, setCondition ] = useState<InputCondition>({ blurred: false, touched: false });

  const _validate = useCallback((newValue: unknown): Validity => {
      const { isValid, errors: returnedErrors } = validationUtils.validateAll(newValue, validation);
      // Only setErrors if value is truthy or if it is required
      const clearErrors = !newValue && !options.required;
      const newErrors = clearErrors ? [] : returnedErrors;
      // Only setErrors if input has been blurred
      if (condition.blurred) setErrors(newErrors);
      return { isValid, errors: newErrors };
  }, [validation, options.required, condition.blurred]);

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    setCondition(prev => ({ ...prev, touched: true }));
    const { value: newValue } = e.target;
    // Validate only if input has first been blurred. (Blurred occurs only after input is touched)
    _validate(newValue);
    setValue(newValue);
  }, [_validate]);
  
  const onBlur = useCallback((): void => {
    // Validate only if input has been touched
    if (condition.touched) {
      // Updated blurred condition
      if (!condition.blurred) setCondition(prev => ({ ...prev, blurred: true }));
      // Validate new value
      const { isValid, errors: newErrors } = _validate(value);
      // Only include errors if value is truthy or if it is required
      // _validate usually setError will not because condition.blurred is only now adjusted
      setErrors(newErrors);
      // Save value to prevValue if enforceValidation is true
      if (options.enforceValidation && isValid) setPrevValue(value);
      // Revert to previous valid value if enforceValidation is true
      if (options.enforceValidation && !isValid) setValue(prevValue);
    }
  }, [_validate, condition, value, options.enforceValidation, prevValue]);

  // Reset everything to initState. Preserve errors by passing false
  const onReset = useCallback((resetErrors: boolean = true): void => {
    setValue(initValue);
    setCondition({ blurred: false, touched: false });
    if (resetErrors) setErrors([]);
  }, [initValue]);

  return {
    name,
    value,
    errors,
    isRequired: options.required,
    touched: condition.touched,
    blurred: condition.blurred,
    onChange,
    onBlur,
    onReset,
  }
}




/* "use client";
import { validationUtils, ValidationFn, IS_REQUIRED } from "@/lib/validation";
import { useCallback, useEffect, useRef, useState } from "react";

export type UseInputReturn = {
  name: string,
  value: string | number,
  isRequired: boolean,
  errors: string[],
  touched: boolean,
  blurred: boolean,

  // This may need to become a Union Type of HTMLTextAreaElement and HTMLSelectElement as the program grows
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  validate: () => void;
  onReset: (value?: boolean) => void;
  addDep: (dep: UseInputReturn) => void;
  getDeps: () => string[];
};

export interface UseInputOptions {
  dependencies?: UseInputReturn[],
  enforceValidation?: boolean,
}

export default function useInput(
  initName: string, 
  initValue: string | number = "", 
  initValidation: ValidationFn[] = [], 
  initOptions?: UseInputOptions): UseInputReturn  {
  
    // Initial error checks
  if (!initName) {
    throw new Error("useInput requires a name");
  }
  
  // Configuration
  const { name, isRequired } = validationUtils.removeAsterisk(initName);
  const options: UseInputOptions =  {
    enforceValidation: initOptions?.enforceValidation || false,
  }

  // Update validationFns array to include isRequired if necessary
  const validationFns: ValidationFn[] = [...initValidation];
  (isRequired && validationFns.length === 0) && validationFns.push(IS_REQUIRED);
  
  // Set initial state
  const [ errors, setErrors ] = useState<string[]>([]);
  const [ value, setValue ] = useState(initValue);
  const [ condition, setCondition ] = useState({
    touched: options?.enforceValidation ?? false,
    blurred: options?.enforceValidation ?? false,
  });


  const deps = useRef(new Set(initOptions?.dependencies || []));

  useEffect(() => {
    deps.current.forEach(d => d.validate());
  }, [value]);

  // EVENT HANDLERS
  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value: newValue } = e.target;
    let newErrors: string[] = [];

    // Validate and update errors on each change following initial blur event
    if (condition.blurred) {
      newErrors = validationUtils.validateAll(newValue, validationFns).errors;
      setErrors(newErrors);
    }

    // Update touched condition
    if (!condition.touched) setCondition(prev => ({ ...prev, touched: true }));

    // Ensures that values are not changed if validation is enforced
    if (newErrors.length === 0 || options?.enforceValidation === false) setValue(newValue);

    // Revalidate dependency array
    deps.current.forEach(d => d.validate());
  }, [condition, validationFns, deps, options?.enforceValidation]);

  const onBlur = useCallback((): void => {
    if (condition.touched) {
      if (!condition.blurred) setCondition(prev => ({ ...prev, blurred: true }));
      const { errors: newErrors } = validationUtils.validateAll(value, validationFns);
      setErrors(newErrors);
    }
  }, [condition, value, validationFns]);

  // Accepts false as an argument if error messages should be retained
  const onReset = useCallback((resetErrorMessages: boolean = true): void => {
    setValue(initValue);
    setCondition({ blurred: false, touched: false });
    if (resetErrorMessages) setErrors([]);
  }, [initValue]);

  const validate = useCallback((): void => {
    if (condition.blurred) {
      const { errors: newErrors } = validationUtils.validateAll(value, validationFns);
      setErrors(newErrors);
    }
  }, [value, validationFns, condition.blurred]);

  // Dependency helper functions
  const addDep = (dep: UseInputReturn): void => { 
    deps.current.add(dep); 
  }
  const getDeps = (): string[] => {
    return [...deps.current].map(d => d.name);
  }

  return {
    name,
    value,
    isRequired,
    errors,
    touched: condition.touched,
    blurred: condition.blurred,
    onChange,
    onBlur,
    onReset,
    validate,
    addDep,
    getDeps,
  }
} */