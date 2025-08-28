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
  enforceValidation?: "none" | "soft" | "hard",
  required?: boolean,
  dependencies?: string[],
}

// Internal type that require all props
type UseInputOptions = Required<UseInputOptionsInput>;

export default function useInput(
  initName: string = "", 
  initValue: string | boolean | number = "",
  initValidation: ValidationFn[] = [],
  initOptions: UseInputOptionsInput = {}
): UseInputReturn {
  // Check if name contains trailing asterisk
  const { name, isRequired } = validationUtils.removeAsterisk(initName);
  // Update validationFns
  const validation: ValidationFn[] = useMemo((): ValidationFn[] => {
    if (isRequired && initValidation.length === 0) return [...initValidation, IS_REQUIRED];
    return [...initValidation];
  }, [initValidation, isRequired]);

  // Update input options
  const options: UseInputOptions = useMemo((): UseInputOptions => {
    return {
      enforceValidation: "none",
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

  const validate = useCallback((newValue: unknown = value): Validity => {
      const { isValid, errors: returnedErrors } = validationUtils.validateAll(newValue, validation);
      // Only setErrors if value is truthy or if it is required
      const clearErrors = !newValue && !options.required;
      const newErrors = clearErrors ? [] : returnedErrors;
      // Only setErrors if input has been blurred
      return { isValid, errors: newErrors };
  }, [validation, options.required, value]);

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>): void => {
    setCondition(prev => ({ ...prev, touched: true }));
    const { value: newValue } = e.target;

    const { isValid, errors: newErrors } = validate(newValue);
    // Update errors only if input has been blurred
    if (condition.blurred) setErrors(newErrors);

    setValue(prev => {
      if (options.enforceValidation === "hard" && !isValid) return prev;
      return newValue
    });
  }, [validate, condition.blurred, options.enforceValidation]);
  
  const onBlur = useCallback((): void => {
    // Validate only if input has been touched
    if (condition.touched) {
      // Updated blurred condition
      if (!condition.blurred) setCondition(prev => ({ ...prev, blurred: true }));
      // Validate new value
      const { isValid, errors: newErrors } = validate();
      // Only include errors if value is truthy or if it is required
      // validate usually setError will not because condition.blurred is only now adjusted
      setErrors(newErrors);
      // Save value to prevValue if enforceValidation is true
      if (options.enforceValidation !== "none" && isValid) setPrevValue(value);
      // Revert to previous valid value if enforceValidation is true
      if (options.enforceValidation === "soft" && !isValid) setValue(prevValue);

    }
  }, [validate, condition, value, options.enforceValidation, prevValue]);

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