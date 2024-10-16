import { Logger } from '@app/internal/logger';
import { Env } from '@app/internal/env';
import { Redis } from 'ioredis';
import { createRedisInstance } from '@app/utils/redis';
import Deasyncify from 'deasyncify';

export async function configureTokenStore(
  env: Env,
  logger: Logger,
): Promise<Redis> {
  const url = env.get('TOKEN_STORE_URL');

  const [redis, err] = await Deasyncify.watch(createRedisInstance(url));

  if (err != null) {
    logger.error(err);
    throw err;
  }

  logger.log('connected to token_store');

  return redis;
}
