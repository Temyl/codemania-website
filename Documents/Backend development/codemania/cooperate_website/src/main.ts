import 'module-alias/register';
import 'reflect-metadata';
import './http/controllers';

import * as http from 'http';
import {  MODULE_TOKENS } from '@app/ioc/tokens';
import { Env } from '@app/internal/env';
import { Knex } from 'knex';
import { App } from './app';
import { isHealthy } from '@app/config/health';
import { Logger } from '@app/internal/logger';
import { configureAppContainer } from '@app/ioc/container';
import { getRouteInfo } from 'inversify-express-utils';
import { logRoutes } from '@app/utils/log-routes';
import process from 'process';

export async function bootstrap() {
  const container = await configureAppContainer();

  const env = container.get<Env>(MODULE_TOKENS.Env);
  const pg = container.get<Knex>(MODULE_TOKENS.KnexClient);
  const logger = container.get<Logger>(MODULE_TOKENS.Logger);

  const app = new App(container, logger, () => isHealthy(pg));

  const appServer = app.server.build();

  const routeInfo = getRouteInfo(container);

  logRoutes(routeInfo, logger);

  const httpServer = http.createServer(appServer);

  httpServer.listen(env.get<string>('PORT'));

  httpServer.on('listening', () => {
    logger.log(`listening on port ${env.get<string>('PORT')} 🚀`);
  });

  process.on('SIGTERM', async () => {
    logger.log('exiting application...');

    httpServer.close(() => {
      process.exit(0);
    });
  });
}

bootstrap();
