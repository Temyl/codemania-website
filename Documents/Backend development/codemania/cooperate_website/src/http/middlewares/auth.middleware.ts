import { inject, injectable } from 'inversify';
import { ApplicationError } from '@app/internal/errors';
import { StatusCodes } from 'http-status-codes';
import { Request, Response, NextFunction } from 'express';
import Deasyncify from 'deasyncify';
import { BaseMiddleware } from 'inversify-express-utils';
import { MODULE_TOKENS } from '@app/ioc/tokens';
import { TokenAuth, InvalidTokenError } from '@app/modules/token-auth';
import { Claim } from '@app/internal/types';

@injectable()
export class AuthMiddleware extends BaseMiddleware {
  @inject(MODULE_TOKENS.TokenAuth) tokenAuth: TokenAuth;
  public async handler(req: Request, _res: Response, next: NextFunction) {
    try {
      const authorizationHeader = String(req.headers['authorization']);

      const auth_token = authorizationHeader?.split?.(' ')?.[1];

      if (auth_token == null) {
        throw new ApplicationError(StatusCodes.UNAUTHORIZED, 'UNAUTHORIZED');
      }

      const [tokenPayload, err] = await Deasyncify.watch(
        this.tokenAuth.verify<Claim>(auth_token),
      );

      if (err != null) {
        if (err instanceof InvalidTokenError) {
          throw new ApplicationError(StatusCodes.UNAUTHORIZED, 'unauthorized');
        }

        throw err;
      }

      (req as any).claim = tokenPayload;
      (req as any).claimId = await this.tokenAuth.getTokenId(auth_token);
      next();
    } catch (e) {
      next(e);
    }
  }
}
