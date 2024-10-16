import { ApplicationError } from '@app/internal/errors';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ValidatorOptions } from 'class-validator';
import { Constructor } from '@app/internal/types';
import { DtoValidationError, validateDto } from '@app/utils/validator-utils';

export function validationPipe<T>(
  dtoClass: Constructor<T>,
  context: 'body' | 'query' | 'params' = 'body',
  validatorOptions: ValidatorOptions = {},
) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const value = req[context];

      req[context] = validateDto(value, dtoClass, validatorOptions);
      next();
    } catch (err) {
      if (err instanceof DtoValidationError) {
        const message =
          context === 'body'
            ? 'Invalid request body'
            : 'Invalid query parameters';

        throw new ApplicationError(
          StatusCodes.BAD_REQUEST,
          message,
          err.messages,
        );
      }

      throw err;
    }
  };
}
