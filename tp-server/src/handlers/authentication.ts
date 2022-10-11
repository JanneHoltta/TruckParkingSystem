import { FastifyReply, FastifyRequest } from 'fastify';
import { errors, types } from '@truck-parking/tp-api';
import * as argon2 from 'argon2';
import { Model } from 'objection';
import DBUser from '../models/db/DBUser';

/**
 * This handler takes the credentials supplied by the user and verifies them from the DB.
 * On valid credentials, the user's userID is returned, otherwise the invalid credentials error is returned.
 *
 * @param request
 * @param response
 */
// eslint-disable-next-line import/prefer-default-export
export const authenticate = async (
  request: FastifyRequest<{ Body: types.Login }>,
  response: FastifyReply,
): Promise<types.Authenticated | types.Error> => {
  const user = await DBUser.query(request.trx).where('emailAddress', request.body.username).first();

  if (user) {
    // Verify the user's password
    if (await argon2.verify(user.passwordHash, request.body.password)) {
      await DBUser.query(request.trx).patch({ lastLoginDateTime: Model.fn.now() }).where('ID', user.ID);

      response.code(200);
      return {
        userID: user.ID,
      };
    }
  }

  // If either the username or password was incorrect, return the invalid credentials response
  response.code(errors.invalidCredentials.statusCode);
  return errors.invalidCredentials;
};
