import { FastifyRequest } from 'fastify';
import { types } from '@truck-parking/tp-api';
import DBUser from '../../models/db/DBUser';

/**
 * Checks whether a user with the given userID exists in the database
 */
// eslint-disable-next-line import/prefer-default-export
export const userExists = async (
  request: FastifyRequest<{ Params: types.UserID }>,
): Promise<boolean> => !!(
  await DBUser.query(request.trx).findById(request.params.userID)
);
