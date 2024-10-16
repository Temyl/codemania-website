export const SERVICE_TOKENS = {
  UserService: Symbol.for('UserService'),
  BlogService: Symbol.for('BlogService'),
};

export const MODULE_TOKENS = {
  Jwt: Symbol.for('Jwt'),
  Env: Symbol.for('Env'),
  Repository: Symbol.for('Repository'),
  KnexClient: Symbol.for('KnexClient'),
  Logger: Symbol.for('Logger'),
  AppCache: Symbol.for('AppCache'),
  Otp: Symbol.for('Otp'),
  SendChampHttpClient: Symbol.for('SendChampHttpClient'),
  SendChamp: Symbol.for('SendChamp'),
  TokenStore: Symbol.for('TokenStore'),
  TokenAuth: Symbol.for('TokenAuth'),
};

export const BROKER_TOKENS = {
  SendChamp: Symbol.for('SendChamp'),
  
}

export const OPTIONS_TOKENS = {
  JwtOptions: Symbol.for('JwtOptions'),
};

export const MIDDLEWARE_TOKENS = {
  AuthMiddleware: Symbol.for('AuthMiddleware'),
};
