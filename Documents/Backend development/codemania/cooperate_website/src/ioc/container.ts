import { Container } from 'inversify';
import { Logger } from '@app/internal/logger';
import { defaultSerializers } from '@app/internal/logger/serializers';
import {
  MIDDLEWARE_TOKENS,
  MODULE_TOKENS,
  SERVICE_TOKENS,
} from '@app/ioc/tokens';
import { Env } from '@app/internal/env';
import envValidator from '@app/internal/env/env.validator';
import { postgresFactory } from '@app/config/postgres';
import { Knex } from 'knex';
import { Repository } from '@app/internal/postgres/repository';
import { configCache } from '@app/config/cache';
import { Cache } from 'cache-manager';
import { Otp } from '@app/modules/otp';
import { configureTokenStore } from '@app/config/token-store';
import { AuthMiddleware } from '@app/http/middlewares/auth.middleware';
import { TokenStore } from '@app/internal/token-store';
import { TokenAuth } from '@app/modules/token-auth';

import { UserService } from '@app/services/user/user.service';
import { SendChamp, SendChampHttpClient } from '@app/modules/sendchamp';
import { BlogService } from '@app/services/blogs/blog.service';





export async function configureAppContainer(): Promise<Container> {
  const container = new Container();

  container.bind<Env>(MODULE_TOKENS.Env).to(Env);

  const env = container.get<Env>(MODULE_TOKENS.Env);

  const logger = new Logger({
    name: env.get<string>('SERVICE_NAME') ?? 'corporate',
    serializers: defaultSerializers(),
  });

  container.bind<Logger>(MODULE_TOKENS.Logger).toConstantValue(logger);

  env.load(envValidator);

  const pg = await postgresFactory(env, logger);

  container.bind<Knex>(MODULE_TOKENS.KnexClient).toConstantValue(pg);

  container.bind<Repository>(MODULE_TOKENS.Repository).to(Repository);

  const appCache = await configCache(env, logger);

  container.bind<Cache>(MODULE_TOKENS.AppCache).toConstantValue(appCache);

  container.bind<Otp>(MODULE_TOKENS.Otp).to(Otp);
  
  const tokenStoreRedis = await configureTokenStore(env, logger);

  const tokenStore = new TokenStore(
    env.get('TOKEN_STORE_SECRET'),
    tokenStoreRedis,
  );

  const tokenAuth = new TokenAuth(tokenStore);

  container
    .bind<TokenStore>(MODULE_TOKENS.TokenStore)
    .toConstantValue(tokenStore);

  container.bind<TokenAuth>(MODULE_TOKENS.TokenAuth).toConstantValue(tokenAuth);

  container
    .bind<AuthMiddleware>(MIDDLEWARE_TOKENS.AuthMiddleware)
    .to(AuthMiddleware);

  

  container.bind<UserService>(SERVICE_TOKENS.UserService).to(UserService);

  container
    .bind<SendChampHttpClient>(MODULE_TOKENS.SendChampHttpClient)
    .to(SendChampHttpClient)
    .inSingletonScope();

  
  container
    .bind<SendChamp>(MODULE_TOKENS.SendChamp)
    .to(SendChamp)
    .inSingletonScope();

  container
    .bind<BlogService>(SERVICE_TOKENS.BlogService)
    .to(BlogService)
  
  
  
  return container;
}
