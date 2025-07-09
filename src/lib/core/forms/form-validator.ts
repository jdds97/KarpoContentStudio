// Sistema de validación de formularios


import type {
  ValidationResult,
  ValidationRule,
  ValidationContext,
  FormValidator
} from '@/types';

// Reglas de validación específicas
export class RequiredRule implements ValidationRule<string> {
  constructor(private message: string = 'Este campo es obligatorio') {}

  validate(value: string): ValidationResult {
    const isValid = value !== null && value !== undefined && value.trim().length > 0;
    return {
      isValid,
      errors: isValid ? [] : [this.message]
    };
  }

  getMessage(): string {
    return this.message;
  }
}

export class EmailRule implements ValidationRule<string> {
  private emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  constructor(private message: string = 'El formato del email no es válido') {}

  validate(value: string): ValidationResult {
    if (!value || value.trim().length === 0) {
      return { isValid: true, errors: [] }; // Saltar si está vacío
    }

    const isValid = this.emailRegex.test(value.trim());
    return {
      isValid,
      errors: isValid ? [] : [this.message]
    };
  }

  getMessage(): string {
    return this.message;
  }
}

export class PhoneRule implements ValidationRule<string> {
  private phoneRegex = /^(\+34|0034|34)?[6789]\d{8}$/;
  
  constructor(private message: string = 'El formato del teléfono no es válido') {}

  validate(value: string): ValidationResult {
    if (!value || value.trim().length === 0) {
      return { isValid: true, errors: [] };
    }

    const cleanValue = value.replace(/[\s-]/g, '');
    const isValid = this.phoneRegex.test(cleanValue);
    
    return {
      isValid,
      errors: isValid ? [] : [this.message]
    };
  }

  getMessage(): string {
    return this.message;
  }
}

export class LengthRule implements ValidationRule<string> {
  constructor(
    private minLength: number,
    private maxLength?: number,
    private message?: string
  ) {
    if (!this.message) {
      if (this.maxLength) {
        this.message = `Debe tener entre ${minLength} y ${maxLength} caracteres`;
      } else {
        this.message = `Debe tener al menos ${minLength} caracteres`;
      }
    }
  }

  validate(value: string): ValidationResult {
    if (!value) {
      return { isValid: true, errors: [] };
    }

    const length = value.trim().length;
    const isValid = length >= this.minLength && (!this.maxLength || length <= this.maxLength);
    
    return {
      isValid,
      errors: isValid ? [] : [this.message!]
    };
  }

  getMessage(): string {
    return this.message!;
  }
}

export class PatternRule implements ValidationRule<string> {
  constructor(
    private pattern: RegExp,
    private message: string = 'El formato no es válido'
  ) {}

  validate(value: string): ValidationResult {
    if (!value || value.trim().length === 0) {
      return { isValid: true, errors: [] };
    }

    const isValid = this.pattern.test(value);
    return {
      isValid,
      errors: isValid ? [] : [this.message]
    };
  }

  getMessage(): string {
    return this.message;
  }
}

export class CustomRule implements ValidationRule {
  constructor(
    private validatorFn: (value: unknown, context?: ValidationContext) => boolean | Promise<boolean>,
    private message: string = 'Valor no válido'
  ) {}

  async validate(value: unknown, context?: ValidationContext): Promise<ValidationResult> {
    try {
      const isValid = await this.validatorFn(value, context);
      return {
        isValid,
        errors: isValid ? [] : [this.message]
      };
    } catch {
      return {
        isValid: false,
        errors: ['Error en la validación personalizada']
      };
    }
  }

  getMessage(): string {
    return this.message;
  }
}

// Clase principal para validación de formularios
export class FormValidationManager implements FormValidator {
  private rules: Map<string, ValidationRule[]> = new Map();
  private asyncValidators: Map<string, ValidationRule[]> = new Map();

  public addRule(fieldName: string, rule: ValidationRule): void {
    if (!this.rules.has(fieldName)) {
      this.rules.set(fieldName, []);
    }
    this.rules.get(fieldName)!.push(rule);

    // Separar validadores asíncronos
    if (rule instanceof CustomRule) {
      if (!this.asyncValidators.has(fieldName)) {
        this.asyncValidators.set(fieldName, []);
      }
      this.asyncValidators.get(fieldName)!.push(rule);
    }
  }

  public async validate(formData: FormData): Promise<ValidationResult> {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    // Validar todos los campos
    for (const [fieldName] of this.rules) {
      const value = formData.get(fieldName);
      const context: ValidationContext = {
        fieldName,
        formData
      };

      const result = await this.validateField(fieldName, value, context);
      allErrors.push(...result.errors);
      if (result.warnings) {
        allWarnings.push(...result.warnings);
      }
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings.length > 0 ? allWarnings : undefined
    };
  }

  public async validateField(
    fieldName: string, 
    value: unknown, 
    context?: ValidationContext
  ): Promise<ValidationResult> {
    const fieldRules = this.rules.get(fieldName) || [];
    const errors: string[] = [];
    const warnings: string[] = [];

    // Ejecutar validaciones síncronas
    for (const rule of fieldRules) {
      if (!(rule instanceof CustomRule)) {
        const result = await Promise.resolve(rule.validate(value, context));
        if (!result.isValid) {
          errors.push(...result.errors);
        }
        if (result.warnings) {
          warnings.push(...result.warnings);
        }
      }
    }

    // Ejecutar validaciones asíncronas
    const asyncRules = this.asyncValidators.get(fieldName) || [];
    for (const rule of asyncRules) {
      try {
        const result = await (rule as CustomRule).validate(value, context);
        if (!result.isValid) {
          errors.push(...result.errors);
        }
        if (result.warnings) {
          warnings.push(...result.warnings);
        }
      } catch {
        errors.push('Error en la validación');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  public removeRule(fieldName: string, rule: ValidationRule): void {
    const fieldRules = this.rules.get(fieldName);
    if (fieldRules) {
      const index = fieldRules.indexOf(rule);
      if (index > -1) {
        fieldRules.splice(index, 1);
      }
    }

    const asyncRules = this.asyncValidators.get(fieldName);
    if (asyncRules) {
      const index = asyncRules.indexOf(rule);
      if (index > -1) {
        asyncRules.splice(index, 1);
      }
    }
  }

  public clearRules(fieldName?: string): void {
    if (fieldName) {
      this.rules.delete(fieldName);
      this.asyncValidators.delete(fieldName);
    } else {
      this.rules.clear();
      this.asyncValidators.clear();
    }
  }

  public getRules(fieldName: string): ValidationRule[] {
    return this.rules.get(fieldName) || [];
  }
}

// Factory para crear validadores comunes
export class ValidationRuleFactory {
  static required(message?: string): RequiredRule {
    return new RequiredRule(message);
  }

  static email(message?: string): EmailRule {
    return new EmailRule(message);
  }

  static phone(message?: string): PhoneRule {
    return new PhoneRule(message);
  }

  static length(min: number, max?: number, message?: string): LengthRule {
    return new LengthRule(min, max, message);
  }

  static pattern(pattern: RegExp, message?: string): PatternRule {
    return new PatternRule(pattern, message);
  }

  static custom(
    validatorFn: (value: unknown, context?: ValidationContext) => boolean | Promise<boolean>,
    message?: string
  ): CustomRule {
    return new CustomRule(validatorFn, message);
  }
}

// Builder para configuración de validación
export class FormValidatorBuilder {
  private validator = new FormValidationManager();

  field(fieldName: string): FieldValidatorBuilder {
    return new FieldValidatorBuilder(fieldName, this.validator, this);
  }

  build(): FormValidationManager {
    return this.validator;
  }
}

export class FieldValidatorBuilder {
  constructor(
    private fieldName: string,
    private validator: FormValidationManager,
    private formBuilder: FormValidatorBuilder
  ) {}

  required(message?: string): FieldValidatorBuilder {
    this.validator.addRule(this.fieldName, ValidationRuleFactory.required(message));
    return this;
  }

  email(message?: string): FieldValidatorBuilder {
    this.validator.addRule(this.fieldName, ValidationRuleFactory.email(message));
    return this;
  }

  phone(message?: string): FieldValidatorBuilder {
    this.validator.addRule(this.fieldName, ValidationRuleFactory.phone(message));
    return this;
  }

  length(min: number, max?: number, message?: string): FieldValidatorBuilder {
    this.validator.addRule(this.fieldName, ValidationRuleFactory.length(min, max, message));
    return this;
  }

  pattern(pattern: RegExp, message?: string): FieldValidatorBuilder {
    this.validator.addRule(this.fieldName, ValidationRuleFactory.pattern(pattern, message));
    return this;
  }

  custom(
    validatorFn: (value: unknown, context?: ValidationContext) => boolean | Promise<boolean>,
    message?: string
  ): FieldValidatorBuilder {
    this.validator.addRule(this.fieldName, ValidationRuleFactory.custom(validatorFn, message));
    return this;
  }

  field(fieldName: string): FieldValidatorBuilder {
    return this.formBuilder.field(fieldName);
  }

  build(): FormValidationManager {
    return this.formBuilder.build();
  }
}