import { types } from '@truck-parking/tp-api';
import { FastifyReply, FastifyRequest } from 'fastify';
import axios from 'axios';
import { checkResponse, serverQuery } from '../server';

/**
 * Handler for retrieving the recent vehicles for the user
 * @param request
 * @param response
 */
// eslint-disable-next-line import/prefer-default-export
export const getRecentVehicles = async (
  request: FastifyRequest,
  response: FastifyReply,
): Promise<types.RecentVehicles | types.Error> => serverQuery(
  response,
  async () => axios.get(`/user/${request.userID}/recentVehicles`)
    .then(checkResponse([200], [404]))
    .then((serverResponse) => ({
      headers: serverResponse.headers, code: serverResponse.status, body: serverResponse.data,
    })),
);
