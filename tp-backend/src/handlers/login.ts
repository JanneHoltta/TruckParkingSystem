import { types } from '@truck-parking/tp-api';
import { FastifyReply, FastifyRequest } from 'fastify';
import axios from 'axios';
import { newSession, SessionConfig } from '../session';
import { checkResponse, serverQuery } from '../server';

/**
 * Handler for requests to the `/login` endpoint, initiates new sessions
 * @param config session handler configuration
 */
// eslint-disable-next-line import/prefer-default-export
export const login = (config: SessionConfig) => async (
  request: FastifyRequest,
  response: FastifyReply,
): Promise<types.Error | undefined> => serverQuery(
  response,
  async () => axios.post('/authenticate', request.body)
    .then(checkResponse([200], [403]))
    .then((serverResponse) => {
      // Get the user ID from the server response
      const { userID } = serverResponse.data;
      // Generate a new session for the user
      newSession(config, response, userID);
      return { headers: serverResponse.headers, code: 204, body: undefined };
    }),
);
