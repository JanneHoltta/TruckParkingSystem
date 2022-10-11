import { Knex } from 'knex';
import { FastifyLoggerInstance } from 'fastify';

/**
 * Commit the given transaction if not completed yet
 *
 * @param trx knex transaction
 * @param log fastify logger
 */
export const commit = async (
  trx: Knex.Transaction,
  log: FastifyLoggerInstance,
): Promise<void> => {
  if (trx && !trx.isCompleted()) {
    log.debug('Committing transaction');
    await trx.commit();
  }
};

/**
 * Rollback the given transaction if not completed yet
 *
 * @param trx knex transaction
 * @param log fastify logger
 */
export const rollback = async (
  trx: Knex.Transaction,
  log: FastifyLoggerInstance,
): Promise<void> => {
  if (trx && !trx.isCompleted()) {
    log.debug('Rolling back transaction');
    await trx.rollback();
  }
};
