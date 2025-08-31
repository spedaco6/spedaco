import { randomUUID } from "crypto";

export interface Validity {
  isValid: boolean,
  errors: string[],
};

export type ValidationFn = (value: unknown) => Validity;

export const validationUtils = {
  removeAsterisk: (initName: string): { name: string, isRequired: boolean } => { 
    const name = validationUtils.trimAndDespace(initName);
    if (name === "*" || name === "") {
      const random = randomUUID();
      return { name: `no-name-${random}`, isRequired: name === "*" };
    }
    const matches = name.match(/^(?<name>.+)\*$/);
    const revName = matches?.groups?.name || name;
    const isRequired = matches ? true : false;
    return { name: revName, isRequired } 
  },
  validateAll: (value: unknown, validationFns: ValidationFn[] = []): Validity => {
    const totalErrors: string[] = [];
    let totalValidity = true;
    for (const fn of validationFns) {
      const { isValid, errors } = fn(value);
      totalValidity = totalValidity && isValid;

      // Only include errors if they are unique
      for (const err of errors) {
        if (!totalErrors.includes(err)) {
          totalErrors.push(err);
    } } }
    return { isValid: totalValidity, errors: totalErrors };
  },
  trimAndDespace: (name: string): string => {
    const dashedName = name.trim().split(" ").filter(seg => seg !== "").join("-");
    return dashedName;
  },
  getString: (initValue: unknown): string => {
    if (initValue === null || initValue === undefined) return "";
    if (typeof initValue !== "string") return String(initValue);
    return initValue.trim();
  }
}

export const IS_REQUIRED: ValidationFn = (initValue: unknown) => {
  const errors: string[] = [];
  const value = validationUtils.getString(initValue);
  if (!value) errors.push("This field cannot be left blank");
  return { isValid: errors.length === 0, errors };
}

export const IS_EMAIL: ValidationFn = (initValue: unknown): Validity => {
  const errors = [];
  const email = validationUtils.getString(initValue); 
  const regex = /^[a-zA-Z0-9](\.?[a-zA-Z0-9!#$%&'*+\-/=?^_`{|}~])*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
  const matches = email.match(regex);
  if (!matches) errors.push("Invalid email address");
  return { isValid: errors.length === 0, errors };
}

export const MIN = (min: number): ValidationFn => {
  return ( initValue: unknown ): Validity => {
    const errors = [];
    const value = validationUtils.getString(initValue);
    if (value.length < min) errors.push(`Must be at least ${min} character${min !== 1 && "s"} long.`);
    return { isValid: errors.length === 0, errors };
  }
}

export const MAX = (max: number): ValidationFn => {
  return ( initValue: unknown ): Validity => {
    const errors = [];
    const value = validationUtils.getString(initValue);
    if (value.length > max) errors.push(`Must not be greater than ${max} character${max !== 1 && "s"} long.`);
    return { isValid: errors.length === 0, errors };
  }
}

export const MATCHES = (matchValue: unknown): ValidationFn => {
  return (value: unknown): Validity => {
    const errors = [];
    if (value !== matchValue) {
      errors.push("Values do not match");
    }
    return { isValid: errors.length === 0, errors };  
  }
}

export const CONTAINS_UC: ValidationFn = (initValue: unknown): Validity => {
  const errors = [];
  const value = validationUtils.getString(initValue); 
  const regex = /^(?=.*[A-Z]).+$/;
  const matches = value.match(regex);
  if (!matches) {
    errors.push("Must contain an upper-case letter");
  }
  return { isValid: errors.length === 0, errors };
}

export const CONTAINS_LC: ValidationFn = (initValue: unknown): Validity => {
  const errors = [];
  const value = validationUtils.getString(initValue); 
  const regex = /^(?=.*[a-z]).+$/;
  const matches = value.match(regex);
  if (!matches) {
    errors.push("Must contain a lower-case letter");
  }
  return { isValid: errors.length === 0, errors };
}

export const CONTAINS_SPECIAL: ValidationFn = (initValue: unknown): Validity => {
  const errors = [];
  const value = validationUtils.getString(initValue); 
  const regex = /^(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?`~]).+$/;
  const matches = value.match(regex);
  if (!matches) {
    errors.push("Must contain a special character");
  }
  return { isValid: errors.length === 0, errors };
}

export const CONTAINS_NUMBER: ValidationFn = (initValue: unknown): Validity => {
  const errors = [];
  const value = validationUtils.getString(initValue); 
  const regex = /^(?=.*\d).+$/;
  const matches = value.match(regex);
  if (!matches) {
    errors.push("Must contain a number");
  }
  return { isValid: errors.length === 0, errors };
}

// Validation Presets
export const VALID_EMAIL: ValidationFn[] = [IS_EMAIL];
export const VALID_PASS: ValidationFn[] = [MIN(8), CONTAINS_LC, CONTAINS_UC, CONTAINS_SPECIAL, CONTAINS_NUMBER];