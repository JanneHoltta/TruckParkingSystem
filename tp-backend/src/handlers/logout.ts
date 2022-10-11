import { types } from '@truck-parking/tp-api';
import { FastifyReply, FastifyRequest } from 'fastify';
import { endSession } from '../session';

/**
 * Handler for requests to the `/logout` endpoint, invalidates sessions
 */
// eslint-disable-next-line import/prefer-default-export
export const logout = async (request: FastifyRequest, response: FastifyReply): Promise<types.Error | void> => {
  endSession(response);
  response.code(204);
};
