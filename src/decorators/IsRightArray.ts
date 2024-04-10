import { BetExpectation } from 'src/types/expectation';
import {
  ValidationOptions,
  isURL,
  ValidateBy,
  buildMessage,
} from 'class-validator';

export const IS_RIGHT_ARRAY = 'isRightArray';

/**
 * Checks if string is empty and if not, checks if it's a URL.
 */
export function isRightArray(
  values: Array<BetExpectation>,
  length: number,
): boolean {
  return values.length === length;
}

/**
 * Checks if string is empty and if not, checks if it's a URL.
 */
export function IsRightArray(
  length: number,
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return ValidateBy(
    {
      name: IS_RIGHT_ARRAY,
      validator: {
        validate: (values): boolean => isRightArray(values, length),
        defaultMessage: buildMessage(
          (eachPrefix) => eachPrefix + `$property length must be ${length}`,
          validationOptions,
        ),
      },
    },
    validationOptions,
  );
}
