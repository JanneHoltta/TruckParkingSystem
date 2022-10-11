import { types } from '@truck-parking/tp-api';
import { FastifyReply, FastifyRequest } from 'fastify';
import axios from 'axios';
import { newSession, SessionConfig } from '../session';
import { checkResponse, serverQuery } from '../server';

/**
 * Handler for requests to the `/signup` endpoint, initiates new sessions
 * TODO: This needs to be rate-limited to prevent brute-force guessing of emails
 * @param config session handler configuration
 */
// eslint-disable-next-line import/prefer-default-export
export const signup = (config: SessionConfig) => async (
  request: FastifyRequest,
  response: FastifyReply,
): Promise<types.Error | undefined> => serverQuery(
  response,
  async () => axios.post('/user', request.body)
    .then(checkResponse([201], [409]))
    .then((serverResponse) => {
      // Get the user ID from the server response
      const { ID } = serverResponse.data;
      // Generate a new session for the user
      newSession(config, response, ID);
      return { headers: serverResponse.headers, code: 204, body: undefined };
    }),
);
