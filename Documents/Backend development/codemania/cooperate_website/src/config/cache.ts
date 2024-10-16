import { Env } from '@app/internal/env';
import { Logger } from '@app/internal/logger';
import { caching } from 'cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { DURATION } from '@app/internal/enums';
import Deasyncify from 'deasyncify';

export async function configCache(env: Env, logger: Logger) {
  const url = env.get<string>('APP_CACHE_URL');

  const [store, err] = await Deasyncify.watch(
    redisStore({
      url,
      socket: {
        connectTimeout: 3 * DURATION.SECONDS,
        reconnectStrategy: (retries, cause) => {
          logger.error(cause);
          return Math.min(retries * 50, 500);
        },
      },
    }),
  );

  if (err != null) {
    logger.error(err);
    throw err;
  }

  logger.log(`Connected to App cache [${url}]`);

  return caching(store);
}
