import 'reflect-metadata';

import { App } from '../../express-inversify-template/src/app';
import { Container } from 'inversify';
import request from 'supertest';
import { Env } from '../../express-inversify-template/src/config/env';
import { MODULE_TOKENS } from '../../express-inversify-template/src/ioc/tokens';
import { Logger } from '../../express-inversify-template/src/internal/logger';
import { defaultSerializers } from '../../express-inversify-template/src/internal/logger/serializers';

const container = new Container();

const logger = new Logger({ name: 'eis', serializers: defaultSerializers() });

container.bind<Env>(MODULE_TOKENS.Env).to(Env);

const env = container.get<Env>(MODULE_TOKENS.Env);

env.load();

const app = new App(container, logger).server.build();

describe('[GET] Health checker', () => {
  it('should successfully query the health checker', async () => {
    return request(app).get('/api/health').expect(200);
  });
});
