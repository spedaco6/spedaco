export interface Validity { isValid: boolean, errors: string[] };
export type ValidationFn = ( value: unknown ) => Validity;
export type AllValidators = Record<string, Validator>;
export type AllValues = Record<string, unknown>;
export interface AllValidity { isValid: boolean, validationErrors: Record<string, string[]> };
export interface PasswordOptions {
  min?: number,
  max?: number,
  upper?: boolean,
  lower?: boolean,
  number?: boolean,
  special?: boolean
}

export class Validator {
  private name: string;
  private value: unknown;
  private stagedErrors: Record<string, string[]> = {};
  private isRequired: boolean = false;
  public errors: string[] = [];
  public isValid: boolean = true;

  constructor(name: string, value: unknown) {
    this.name = name;
    this.value = typeof value === "string" ? value.trim() : value;
  }

  public getName(): string { return this.name };
  public getValue(): unknown { return this.value };

  // Private utility functions
  private addErrors(errors: string[], field: string): void {
    this.stagedErrors[field] = [];
    errors.forEach(e => {
      const custom = e.replace(/Value/, this.name);
      if (!this.stagedErrors[field].includes(custom)) this.stagedErrors[field].push(custom);  
    });
  }
  
  private validate(): this {
    const compiledErrors: string[] = Object
      .values(this.stagedErrors)
      .reduce((prev, current) => [...prev, ...current]);
    // Only return required error message if no other errors are included
    this.errors = compiledErrors.length > 1 && this.isRequired ? compiledErrors.filter(e => !e.includes("is required")) : compiledErrors;
    this.isValid = this.errors.length === 0;
    return this;
  }

  // Trim input string and replace spaces with -
  static trimAndDespace(name: string): string {
    const dashedName = name.trim().split(" ").filter(seg => seg !== "").join("-");
    return dashedName;
  }

  // Static utility methods
  static removeAsterisk(initName: string): ({ name: string, isRequired: boolean }) { 
    const name = Validator.trimAndDespace(initName);
    const matches = name.match(/^(?<name>.+)\*$/);
    const revName = matches?.groups?.name || name;
    const isRequired = matches ? true : false;
    return { name: revName, isRequired } 
  }

  static validateAll(value: unknown, validationFns: ValidationFn[] = []): Validity {
    const totalErrors: string[] = [];
    let totalValidity: boolean = true;
    for (const fn of validationFns) {
      const { isValid, errors } = fn(value);
      totalValidity = totalValidity && isValid;

      // Only include errors if they are unique
      for (const err of errors) {
        if (!totalErrors.includes(err)) {
          totalErrors.push(err);
    } } }
    return { isValid: totalValidity, errors: totalErrors };
  }

  static getAllValidators(data: Record<string, unknown> | FormData, include: string[] = []): AllValidators {
    const validators: Record<string, Validator> = {};
    Object.entries(data).forEach(([key, val]) => {
      validators[String(key)] = new Validator(String(key), val);
    });
    include.forEach(input => {
      const { name, isRequired } = Validator.removeAsterisk(input);
      if (!Object.keys(validators).includes(name)){
        validators[String(name)] = new Validator(String(name), null);
      }
      if (isRequired) validators[String(name)].required();
    });
    return validators;
  }

  static getAllValues(validators: AllValidators): AllValues {
    const values: AllValues = {};
    for (const key in validators) {
      values[key] = validators[key].getValue();
    }
    return values;
  }

  static getAllValidity(validators: AllValidators): AllValidity {
    const validationErrors: Record<string, string[]> = {};
    Object.entries(validators).forEach(([key, val]) => {
      if (!val.isValid) validationErrors[key] = val.errors;
    });
    const isValid = Object.keys(validationErrors).length === 0;
    return { isValid, validationErrors };
  }

  // Static validation methods
  static required: ValidationFn = (value) => {
    const errors: string[] = [];
    if (value === "" || value === null || value === undefined || value === false) errors.push("Value is required");
    return { isValid: errors.length === 0, errors };
  }

  static isEmail: ValidationFn = (value) => {
    const errors: string[] = [];
    const email: string = String(value);
      const regex = /^[a-zA-Z0-9](\.?[a-zA-Z0-9!#$%&'*+\-/=?^_`{|}~])*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
      const matches = email.match(regex);
      if (!matches) errors.push("Invalid email address");
    return { isValid: errors.length === 0, errors };
  }

  static isPassword: ((options?: PasswordOptions) => ValidationFn) = (initOptions: PasswordOptions = {}) => {
    return (value: unknown) => {      
      const options: Required<PasswordOptions> = {
        min: 8,
        max: Number.POSITIVE_INFINITY,
        upper: true,
        lower: true,
        number: true,
        special: true,
        ...initOptions,
      }
      const result: Validity[] = [];
      result.push(Validator.min(options.min)(value));
      result.push(Validator.max(options.max)(value));
      if (options.upper) result.push(Validator.hasUpper(value));
      if (options.lower) result.push(Validator.hasLower(value));
      if (options.number) result.push(Validator.hasNumber(value));
      if (options.special) result.push(Validator.hasSpecial(value));

      const final = Object.values(result).reduce((prev, current) => {
        return { isValid: current.isValid && prev.isValid, errors: [...prev.errors, ...current.errors] };
      }, { isValid: true, errors: [] });
      
      return final;
    }
  } 

  static hasUpper: ValidationFn = (value) => {
    const errors: string[] = [];
    const strVal = String(value);
    const matches = strVal.match(/^.*[A-Z]+.*$/);
    if (!matches) errors.push("Value must contain an uppercase character");
    return { isValid: errors.length === 0, errors };
  }
  static hasLower: ValidationFn = (value) => {
    const errors: string[] = [];
    const strVal = String(value);
    const matches = strVal.match(/^.*[a-z]+.*$/);
    if (!matches) errors.push("Value must contain an lowercase character");
    return { isValid: errors.length === 0, errors };
  }
  static hasNumber: ValidationFn = (value) => {
    const errors: string[] = [];
    const strVal = String(value);
    const matches = strVal.match(/^.*[0-9]+.*$/);
    if (!matches) errors.push("Value must contain a number");
    return { isValid: errors.length === 0, errors };
  }
  static hasSpecial: ValidationFn = (value) => {
    const errors: string[] = [];
    const strVal = String(value);
    const matches = strVal.match(/^.*[^0-9A-Za-z\s]+.*$/);
    if (!matches) errors.push("Value must contain a number");
    return { isValid: errors.length === 0, errors };
  }

  static min: ((min: number) => ValidationFn) = (min = 0) => {
    return (value: unknown) => {
      const errors: string[] = [];
      if (typeof value === "string" && value.length < min) errors.push(`Value must be at least ${min} character${min === 1 ? "" : "s" }`);
      if (typeof value === "number" && value < min) errors.push(`Value must be at least ${min}`); 
      return { isValid: errors.length === 0, errors };
    }
  }
  static max: ((max: number) => ValidationFn) = (max = Number.POSITIVE_INFINITY) => {
    return (value: unknown) => {
      const errors: string[] = [];
      if (typeof value === "string" && value.length > max) errors.push(`Value must not be greater than ${max} character${max === 1 ? "" : "s" }`);
      if (typeof value === "number" && value > max) errors.push(`Value must not be greater than ${max}`); 
      return { isValid: errors.length === 0, errors };
    }
  }

  static matches: ((match: unknown) => ValidationFn) = (match) => {
    const isValidator = match instanceof Validator;
    const matchValue = isValidator ? match.getValue() : match;
    return (value: unknown) => {
      const errors: string[] = [];
      if (value !== matchValue) errors.push(`Value does not match${isValidator ? " " + match.getName() : ""}`);
      return { isValid: errors.length === 0, errors };
    }
  }

  // Instance validation methods
  public required(): this {
    this.isRequired = true;
    const { errors } = Validator.required(this.value);
    this.addErrors(errors, "required");
    return this.validate();
  }

  public isEmail(): this {
    const { errors } = Validator.isEmail(this.value);
    this.addErrors(errors, "isEmail");
    return this.validate();
  }

  public isPassword(options: PasswordOptions = {}): this {
    const { errors } = Validator.isPassword(options)(this.value);
    this.addErrors(errors, "isPassword");
    return this.validate();
  }

  public hasUpper(): this {
    const { errors } = Validator.hasUpper(this.value);
    this.addErrors(errors, "hasUpper");
    return this.validate();
  }
  public hasLower(): this {
    const { errors } = Validator.hasLower(this.value);
    this.addErrors(errors, "hasLower");
    return this.validate();
  }
  public hasNumber(): this {
    const { errors } = Validator.hasNumber(this.value);
    this.addErrors(errors, "hasNumber");
    return this.validate();
  }
  public hasSpecial(): this {
    const { errors } = Validator.hasSpecial(this.value);
    this.addErrors(errors, "hasSpecial");
    return this.validate();
  }

  public min(min: number): this {
    const { errors } = Validator.min(min)(this.value);
    this.addErrors(errors, "min");
    return this.validate();
  }
  
  public max(max: number): this {
    const { errors } = Validator.max(max)(this.value);
    this.addErrors(errors, "max");
    return this.validate();
  }
  
  public matches(matchVal: unknown): this {
    const match = matchVal instanceof Validator ? matchVal.getValue() : matchVal;
    const { errors } = Validator.matches(match)(this.value);
    this.addErrors(errors, "matches");
    return this.validate();
  }
}