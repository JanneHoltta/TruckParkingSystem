import fp from 'fastify-plugin';
import { FastifyInstance, FastifyPluginCallback } from 'fastify';
import { Knex } from 'knex';
import { onSendHook, preHandler } from './hooks';

/**
 * Fastify plugin that provides knex transactions for each request
 *
 * Takes care of transaction commits & rollbacks.
 * The transaction can be accessed via `FastifyRequest.trx`.
 */
const objectionPlugin: FastifyPluginCallback = fp(async (fastify: FastifyInstance) => {
  // Add decorators
  fastify.decorateRequest('trx', null);
  fastify.decorateRequest('db', null);

  fastify.addHook('preHandler', preHandler);
  fastify.addHook('onSend', onSendHook);
});

export default objectionPlugin;

declare module 'fastify' {
  interface FastifyRequest {
    readonly trx: Knex.Transaction
  }
}
