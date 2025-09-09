interface Validity { isValid: boolean, errors: string[] };
type ValidationFn = ( value: unknown ) => Validity;


export class Validator {
  private name: string;
  private value: unknown;
  public errors: string[] = [];
  public isValid: boolean = true;

  constructor(name: string, value: unknown) {
    this.name = name;
    this.value = value;
  }

  public getName(): string { return this.name };
  public getValue(): unknown { return this.value };

  // Private utility functions
  private addErrors(errors: string[]): void {
    errors.forEach(e => {
      const custom = e.replace(/Value/, this.name);
      if (!this.errors.includes(custom)) this.errors.push(custom);
    });
  }
  
  private validate(): this {
    this.isValid = this.errors.length === 0;
    return this;
  }

  // Static validation methods
  public static required: ValidationFn = (value) => {
    const errors: string[] = [];
    if (value === "" || value === null || value === undefined) errors.push("Value is required");
    return { isValid: errors.length === 0, errors };
  }

  public static isEmail: ValidationFn = (value) => {
    const errors: string[] = [];
    const email = String(value);
      const regex = /^[a-zA-Z0-9](\.?[a-zA-Z0-9!#$%&'*+\-/=?^_`{|}~])*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
      const matches = email.match(regex);
      if (!matches) errors.push("Invalid email address");
    return { isValid: errors.length === 0, errors };
  }

  public static hasUpper: ValidationFn = (value) => {
    const errors: string[] = [];
    const strVal = String(value);
    const matches = strVal.match(/^.*[A-Z].*$/);
    if (!matches) errors.push("Value must contain an uppercase character");
    return { isValid: errors.length === 0, errors };
  }
  public static hasLower: ValidationFn = (value) => {
    const errors: string[] = [];
    const strVal = String(value);
    const matches = strVal.match(/^.*[a-z].*$/);
    if (!matches) errors.push("Value must contain an lowercase character");
    return { isValid: errors.length === 0, errors };
  }
  public static hasNumber: ValidationFn = (value) => {
    const errors: string[] = [];
    const strVal = String(value);
    const matches = strVal.match(/^.*[0-9].*$/);
    if (!matches) errors.push("Value must contain a number");
    return { isValid: errors.length === 0, errors };
  }
  public static hasSpecial: ValidationFn = (value) => {
    const errors: string[] = [];
    const strVal = String(value);
    const matches = strVal.match(/^.*[^0-9A-Za-z\s].*$/);
    if (!matches) errors.push("Value must contain a number");
    return { isValid: errors.length === 0, errors };
  }

  public static min: ((min: number) => ValidationFn) = (min = 0) => {
    return (value: unknown) => {
      const errors: string[] = [];
      if (typeof value === "string" && value.length < min) errors.push(`Value must be at least ${min} character${min === 1 ? "" : "s" }`);
      if (typeof value === "number" && value < min) errors.push(`Value must be at least ${min}`); 
      return { isValid: errors.length === 0, errors };
    }
  }
  public static max: ((max: number) => ValidationFn) = (max = Number.POSITIVE_INFINITY) => {
    return (value: unknown) => {
      const errors: string[] = [];
      if (typeof value === "string" && value.length > max) errors.push(`Value must not be greater than ${max} character${max === 1 ? "" : "s" }`);
      if (typeof value === "number" && value > max) errors.push(`Value must not be greater than ${max}`); 
      return { isValid: errors.length === 0, errors };
    }
  }

  public static matches: ((match: unknown) => ValidationFn) = (match) => {
    return (value: unknown) => {
      const errors: string[] = [];
      if (value !== match) errors.push("Value does not match");
      return { isValid: errors.length === 0, errors };
    }
  }

  // Instance validation methods
  public required(): this {
    const { isValid, errors } = Validator.required(this.value);
    if (!isValid) this.addErrors(errors);
    return this.validate();
  }

  public isEmail(): this {
    const { isValid, errors } = Validator.isEmail(this.value);
    if (!isValid) this.addErrors(errors);
    return this.validate();
  }

  public hasUpper(): this {
    const { isValid, errors } = Validator.hasUpper(this.value);
    if (!isValid) this.addErrors(errors);
    return this.validate();
  }
  public hasLower(): this {
    const { isValid, errors } = Validator.hasLower(this.value);
    if (!isValid) this.addErrors(errors);
    return this.validate();
  }
  public hasNumber(): this {
    const { isValid, errors } = Validator.hasNumber(this.value);
    if (!isValid) this.addErrors(errors);
    return this.validate();
  }
  public hasSpecial(): this {
    const { isValid, errors } = Validator.hasSpecial(this.value);
    if (!isValid) this.addErrors(errors);
    return this.validate();
  }


  public min: ((min: number) => ValidationFn) = (min) => {
    return (value: unknown) => {
      const errors: string[] = [];
      return { isValid: errors.length === 0, errors };
    }
  }

  public max: ((max: number) => ValidationFn) = (max) => {
    return (value: unknown) => {
      const errors: string[] = [];
      return { isValid: errors.length === 0, errors };
    }
  }

  public matches: ((matches: unknown) => ValidationFn) = (matches) => {
    return (value: unknown) => {
      const errors: string[] = [];
      return { isValid: errors.length === 0, errors };
    }
  }
}