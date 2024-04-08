import { Config } from './config.interface';

const config: Config = {
  nest: {
    port: 5005,
  },
  cors: {
    enabled: true,
  },
  swagger: {
    enabled: true,
    title: 'betting API',
    description: 'API endpoints for betting dapp',
    version: '1.0.0',
    path: 'api',
    persistAuthorization: true,
  },
  security: {
    expiresIn: '30d',
    refreshIn: '90d',
    bcryptSaltOrRound: 10,
  },
  // TODO: change this back to 30 and 180 after bugfix
  throttle: {
    ttl: 3,
    limit: 18000000000,
    ignoreUserAgents: [],
  },
};

export default (): Config => config;
