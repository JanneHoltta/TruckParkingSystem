import { FastifyReply, FastifyRequest } from 'fastify';
import { types } from '@truck-parking/tp-api';

/**
 * This handler is a low-cost no-op primarily used to
 *  - test the liveliness of the server
 *  - retrieve the user's status via the user status header for views that e.g.
 *    don't perform other explicit API requests to trigger the redirection matrix
 */
// eslint-disable-next-line import/prefer-default-export
export const getStatus = async (
  _: FastifyRequest,
  response: FastifyReply,
): Promise<types.StatusNoOp> => {
  response.code(204);

  // Returning null from a handler is currently broken in Fastify.
  // Returning undefined has the same effect, but it doesn't break Fastify.
  return undefined;
};
