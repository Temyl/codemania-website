import { inject, injectable } from 'inversify';
import { MODULE_TOKENS } from '@app/ioc/tokens';
import { Cache } from 'cache-manager';
import { Logger } from '@app/internal/logger';
import { hashPassword, verifyPassword } from '@app/utils/bcrypt-utils';

export interface CreateOtpArgs {
  /** Key that would be linked to the otp  */
  key: string;
  /** length of the otp (default is 6) */
  length?: number;
  /** when otp expires (default is 60 seconds)  */
  expiresIn?: number;
}

@injectable()
export class Otp {
  private readonly prefix = 'otp:';

  constructor(
    @inject(MODULE_TOKENS.AppCache) private readonly appCache: Cache,
    @inject(MODULE_TOKENS.Logger) private readonly logger: Logger,
  ) {}

  private otpKey(key: string) {
    return `${this.prefix}${key}`;
  }

  public async generate({
    key,
    length = 6,
    expiresIn = 60_000,
  }: CreateOtpArgs) {
    const randomBase = Math.floor(Math.random() * 10 ** length);
    const randomFill = Math.floor(Math.random() * 9);
    const otp = randomBase.toString().padStart(length, randomFill.toString());

    const otpHash = await hashPassword(otp);

    await this.appCache.set(this.otpKey(key), otpHash, expiresIn).catch((e) => {
      this.logger.error(e);
      throw e;
    });

    return otp;
  }

  public async verify(key: string, otp: string) {
    const otpHashInCache = await this.appCache.get<string>(this.otpKey(key));

    if (otpHashInCache == null) return false;

    const matchesHash = await verifyPassword(otp, otpHashInCache);

    if (matchesHash) {
      await this.appCache.del(key);
      return true;
    }
    return false;
  }
}
