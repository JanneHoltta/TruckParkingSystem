import Fastify, { FastifyInstance, onRequestAsyncHookHandler } from 'fastify';
import knex from 'knex';
import { Model } from 'objection';
import { errors } from '@truck-parking/tp-api';
import objectionPlugin from './objection';
import { routesPlugin, userRoutesPlugin } from './routes';
import env from './env';

const checkApiKey: onRequestAsyncHookHandler = async (request, reply): Promise<void> => {
  if (request.headers.apikey !== env.server.apikey) {
    reply.code(errors.invalidAPIKey.statusCode).send(errors.invalidAPIKey);
  }
};

const initHTTPServer = async () => {
  const server: FastifyInstance = Fastify({
    logger: {
      level: 'debug',
    },
  });

  const knexInstance = knex({
    client: 'mysql2',
    connection: {
      host: env.db.host,
      port: env.db.port,
      user: env.db.user,
      password: env.db.password,
      database: env.db.database,
      timezone: '+00:00', // Database is set to UTC; do not alter times according to the local time zone.
    },
    pool: { min: 0, max: 10 },
  });

  // Set knex instance for all ObjectionJS Models
  Model.knex(knexInstance);

  // Register hook to check API key before any requests
  server.addHook('onRequest', checkApiKey);

  // Register misc. routes plugin for the server
  server.register(routesPlugin);

  // Register user routes plugin for the server
  server.register(userRoutesPlugin);

  // Register objectionJS transaction plugin
  server.register(objectionPlugin, {});

  try {
    await server.listen(env.server.port, env.server.host);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

initHTTPServer().then();
