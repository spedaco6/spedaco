"use client"

import { Validator, ValidationFn, Validity } from "@/lib/Validator";
import { useCallback, useEffect, useMemo, useState } from "react";

export type UseInputReturn = {
  name: string,
  value: string | number | boolean,
  errors: string[],
  isRequired: boolean,
  touched: boolean,
  blurred: boolean,
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  onBlur: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  onReset: () => void,
  validate: () => void,
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
  dependencies?: (string | number | boolean)[],
  message?: string,
}

export default function useInput(
  initName: string = "", 
  initValue: string | boolean | number = "",
  initValidation: ValidationFn[] = [],
  initOptions: UseInputOptionsInput = {}
): UseInputReturn {
  // Check if name contains trailing asterisk
  const result: { name: string, isRequired: boolean } = Validator.removeAsterisk(initName);
  const { name } = result;
  const isRequired: boolean = initOptions?.required ?? result.isRequired;
  // Check if input is tracking boolean values

  // Update validationFns
  const validation: ValidationFn[] = useMemo((): ValidationFn[] => {
    if (isRequired && initValidation.length === 0) return [...initValidation, Validator.required];
    return [...initValidation];
  }, [initValidation, isRequired]);
  
  // prevValue saves the last valid value in case it must be reverted
  const [ prevValue, setPrevValue ] = useState<string | number | boolean>(initValue);
  const [ value, setValue ] = useState<string | number | boolean>(initValue);
  const [ errors, setErrors ] = useState<string[]>([]);
  const [ condition, setCondition ] = useState<InputCondition>({ blurred: !!initValue, touched: false });

  // Extract options configuration
  const enforceValidation: "none"| "soft" | "hard" = initOptions?.enforceValidation ?? "none";
  const dependencyString: string = initOptions?.dependencies ? "d:" + initOptions?.dependencies?.join(",") : "";
  const isBoolean = typeof initValue === "boolean";
  const message = initOptions.message ?? "";

  const validate = useCallback((newValue: unknown = value): Validity => {

    const { isValid, errors: returnedErrors } = Validator.validateAll(newValue, validation);
  
    // Only setErrors if value is truthy or if it is required
    const hasDependencies: boolean = dependencyString.length > 0;
    const hasValue: boolean = (newValue !== "" && newValue !== undefined && newValue !== null);
    const shouldValidate = isRequired || hasDependencies || hasValue;
    // Override errors with default options message
    const errorMessage = (message && !isValid) ? [ message ] : returnedErrors;
    const newErrors = shouldValidate ? errorMessage : [];
      
      // Only setErrors if input has been blurred
      return { isValid, errors: newErrors };
  }, [validation, isRequired, value, dependencyString, message]);

  const onChange: React.ChangeEventHandler<
    HTMLInputElement | 
    HTMLTextAreaElement | 
    HTMLSelectElement
    > = useCallback((e: React.ChangeEvent<
    HTMLInputElement | 
    HTMLTextAreaElement | 
    HTMLSelectElement
    >): void => {
    // Update input condtion.touched to true
    if (!condition.touched) setCondition(prev => ({ ...prev, touched: true }));
    const { value: newValue } = e.target;
    const { isValid, errors: newErrors } = validate(newValue);
    // Update errors only if input has been blurred
    if (condition.blurred) setErrors(newErrors);
    setValue(prev => {
      if (enforceValidation === "hard" && !isValid) return prev;
      return newValue;
    });
  }, [validate, condition, enforceValidation]);
  
  const onBlur: React.ChangeEventHandler<
    HTMLInputElement | 
    HTMLTextAreaElement | 
    HTMLSelectElement
    > = useCallback((): void => {
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
    if (enforceValidation !== "none" && isValid) setPrevValue(value);
    // Revert to previous valid value if enforceValidation is true
    if (enforceValidation === "soft" && !isValid) setValue(prevValue);
    }
  }, [validate, condition, value, enforceValidation, prevValue]);

  // onToggle will be used for boolean values
  const onToggle: React.ChangeEventHandler<
    HTMLInputElement
    > = useCallback((e: React.ChangeEvent<HTMLInputElement>): void => {
      const { checked } = e.target;
      if (!condition.touched) setCondition(prev => ({ ...prev, touched: true }));
      // Update input condtion.touched to true        
      const { errors: newErrors } = validate(checked);
      // Update errors only if input has been blurred
      if (condition.blurred) setErrors(newErrors);
      setValue(checked);
  }, [validate, condition]);


  // Reset everything to initState. Preserve errors by passing false
  const onReset = useCallback((resetErrors: boolean = true): void => {
    setValue(initValue);
    setCondition({ blurred: false, touched: false });
    if (resetErrors) setErrors([]);
  }, [initValue]);

  useEffect(() => {
    if (condition.blurred && dependencyString.length > 0) {
      const result = validate();
      setErrors(result.errors);
    }
  }, [condition.blurred, validate, dependencyString]);

  return {
    name,
    value,
    errors,
    isRequired,
    touched: condition.touched,
    blurred: condition.blurred,
    onChange: isBoolean ? onToggle : onChange,
    onBlur,
    onReset,
    validate,
  }
}