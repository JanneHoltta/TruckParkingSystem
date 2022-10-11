import { FastifyReply, FastifyRequest } from 'fastify';
import axios from 'axios';
import { types } from '@truck-parking/tp-api';
import { checkResponse, serverQuery } from '../server';

/**
 * Handler for retrieving the plain status information for a user
 * @param request
 * @param response
 */
// eslint-disable-next-line import/prefer-default-export
export const getStatus = async (
  request: FastifyRequest,
  response: FastifyReply,
): Promise<types.StatusNoOp> => serverQuery(
  response,
  async () => axios.get(`/user/${request.userID}/status`)
    .then(checkResponse([204]))
    .then((serverResponse) => ({
      headers: serverResponse.headers, code: serverResponse.status, body: serverResponse.data,
    })),
);
