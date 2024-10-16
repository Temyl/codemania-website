import { Redis } from 'ioredis';

export async function createRedisInstance(url: string): Promise<Redis> {
  const redis = new Redis(url);

  return new Promise<Redis>((resolve, reject) => {
    redis.on('connect', () => {
      resolve(redis);
    });

    redis.on('error', (err) => {
      reject(err);
    });
  });
}
