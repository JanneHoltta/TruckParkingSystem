import { onSendHookHandler, preHandlerHookHandler } from 'fastify';
import { Model } from 'objection';
import { Knex } from 'knex';
import { commit, rollback } from './transaction';
import Transaction = Knex.Transaction;

/**
 * Pre-handler hook for Fastify to provide automatic transaction begin for every request
 *
 * @param request fastify request
 * @param reply fastify reply
 * @param done done callback
 */
export const preHandler: preHandlerHookHandler = (request, reply, done) => {
  Model.startTransaction().then(
    (trx) => {
      // Transaction began

      // By default, rollback transaction if it hasn't committed when the reply has been sent
      reply.then(
        () => {
          if (trx && !trx.isCompleted() && reply.statusCode >= 200 && reply.statusCode < 300) {
            // Reply has been sent with a success status code but, for some strange reason,
            // the transaction has not completed. This should be impossible but
            // it should be logged in case it happens any way.

            // Log this incident
            request.log.warn(
              'Transaction was not committed but a request with status 2xx was sent',
            );
          }

          // Safe Rollback
          rollback(request.trx, request.log).then(
            () => {}, // Default rollback didn't throw errors (should be quiet)
            (err) => {
              // Failed to rollback transaction
              request.log.error(
                { err },
                'Transaction rollback failed for failed request',
              );
            },
          );
        },
        () => { // Request failed
          // Safe rollback
          rollback(request.trx, request.log).then(
            () => {
              // Rolled back transaction
              request.log.debug('Request failed, rolled back transaction');
            },
            (err) => {
              request.log.error(
                { err },
                'Transaction rollback failed for failed request',
              );
            },
          );
        },
      );

      // Decorate request:
      // The following line is a bit of a hack to achieve a decoration which is read only
      // within the route functions. This prevents possible errors by making re-assignment
      // more difficult.
      (request.trx as Transaction) = trx;

      done();
    },
    (err) => {
      // Failed to begin transaction

      const errorMessage = 'Failed to begin transaction';
      request.log.error({ err }, errorMessage);

      // Set response status code to indicate server side error.
      reply.status(500);
      done(new Error(errorMessage));
    },
  );
};

/**
 * On-send hook for Fastify to provide automatic transaction commits for every replied request
 *
 * @param request fastify request
 * @param reply fastify reply
 * @param payload request payload
 * @param done done callback
 */
export const onSendHook: onSendHookHandler<unknown> = (request, reply, payload, done) => {
  if (request.trx) {
    if (reply.statusCode >= 200 && reply.statusCode < 300) {
      // Commit transaction
      commit(request.trx, request.log).then(
        () => done(),
        (err) => {
          // Transaction commit failed
          const errorMessage = 'Failed to commit transaction';
          request.log.error({ err }, errorMessage);
          done(new Error(errorMessage));
        },
      );
    } else {
      // Rollback transaction
      rollback(request.trx, request.log).then(
        () => done(),
        (err) => {
          // Transaction rollback failed
          const errorMessage = 'Failed to rollback transaction';
          request.log.error({ err }, errorMessage);

          // Set response status code to indicate server side error.
          reply.status(500);
          done(new Error(errorMessage));
        },
      );
    }
  } else {
    // Transaction was never begun
    done();
  }
};
