import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
  isInt,
} from 'class-validator';

@ValidatorConstraint({ name: 'digits', async: false })
export class DigitsValidator implements ValidatorConstraintInterface {
  constructor(private readonly digitLength: number) {}
  private digitIsInt(digit: string): boolean {
    const numberValue = Number(digit);

    if (isNaN(numberValue)) return false;

    return isInt(numberValue);
  }

  public validate(value: string) {
    const DIGIT_CORRECT_LENGTH = value.length === this.digitLength;
    return DIGIT_CORRECT_LENGTH && this.digitIsInt(value);
  }

  public defaultMessage(args: ValidationArguments) {
    if (!this.digitIsInt(args.value)) {
      return `${args.property} must be an integer digits`;
    }
    return `${args.property} must be ${this.digitLength} long`;
  }
}

export function Digits(
  digitLength: number,
  validationOptions?: ValidationOptions,
) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'Digits',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: new DigitsValidator(digitLength),
    });
  };
}
