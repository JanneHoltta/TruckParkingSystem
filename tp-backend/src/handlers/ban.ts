import { types } from '@truck-parking/tp-api';
import { FastifyReply, FastifyRequest } from 'fastify';
import axios from 'axios';
import { checkResponse, serverQuery } from '../server';

/**
 * Handler for retrieving the bans of the user
 * @param request
 * @param response
 */
// eslint-disable-next-line import/prefer-default-export
export const getBan = async (
  request: FastifyRequest,
  response: FastifyReply,
): Promise<types.CurrentBans | types.Error> => serverQuery(
  response,
  async () => axios.get(`/user/${request.userID}/ban`)
    .then(checkResponse([200], [404]))
    .then((serverResponse) => ({
      headers: serverResponse.headers, code: serverResponse.status, body: serverResponse.data,
    })),
);
