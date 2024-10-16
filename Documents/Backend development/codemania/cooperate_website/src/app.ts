import express, { Application } from 'express';
import { Container } from 'inversify';
import { InversifyExpressServer } from 'inversify-express-utils';
import Status from 'http-status-codes';
import { capitalize } from 'lodash';
import cors from 'cors';
import helmet from 'helmet';
import responseTime from 'response-time';
import { MODULE_TOKENS } from '@app/ioc/tokens';
import { globalErrorMiddleware } from '@app/http/middlewares/global-error.middleware';
import {
  attachRequestId,
  captureBody,
  logRequest,
  logResponse,
} from '@app/http/middlewares/request-logging.middleware';
import { Logger } from '@app/internal/logger';
import {Env} from "@app/internal/env";

export class App {
  readonly server: InversifyExpressServer;

  constructor(
    container: Container,
    logger: Logger,
    healthCheck = () => Promise.resolve(),
  ) {
    const env = container.get<Env>(MODULE_TOKENS.Env);

    const opts: any = [null, null, false];
    this.server = new InversifyExpressServer(
      container,
      null,
      {
        rootPath: '/',
      },
      ...opts,
    );

    this.server.setConfig((app: Application) => {
      app.disable('x-powered-by');

      app.use(express.json());
      app.use(express.urlencoded({ extended: true }));

      app.use(cors());
      app.options('*', cors());

      app.use(helmet());
      app.use(responseTime());

      app.use(attachRequestId());
      app.use(logRequest(logger));
      app.use(captureBody);
      app.use(logResponse(logger));
    });

    this.server.setErrorConfig((app: Application) => {
      app.get('/api/health', async (_req, res) => {
        try {
          await healthCheck();
        } catch (err) {
          return res.status(Status.INTERNAL_SERVER_ERROR).send(err.message);
        }

        return res
          .status(200)
          .send(
            `${capitalize(env.get<string>('NODE_ENV'))} is up and running 🚀`,
          );
      });

      app.use((_req, res, _next) => {
        return res.sendStatus(404);
      });

      app.use(globalErrorMiddleware(logger));
    });
  }
}
