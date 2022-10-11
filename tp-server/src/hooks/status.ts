import { FastifyInstance, FastifyRequest } from 'fastify';
import { types, headers } from '@truck-parking/tp-api';
import { userStatus } from '../handlers/common/status';

/**
 * This hook adds a header containing the user's status to each response. It must
 * only be called by endpoints that define the user's ID in the request path parameters.
 */
// eslint-disable-next-line import/prefer-default-export
export const addUserStatusHook = (fastify: FastifyInstance): void => {
  fastify.addHook('onSend', async (request: FastifyRequest<{ Params: types.UserID }>, response) => {
    // Only inject header if a valid user is given and there is a valid transaction going
    // on, requiring for example that stuff like input validation hasn't failed first
    if (request.params.userID && request.trx) {
      const status = await userStatus(request.params.userID, request.trx);
      if (status) { // The user must exist for the status to be retrievable
        response.header(headers.userStatus, JSON.stringify(status));
      }
    }
  });
};
