import { FastifyReply, FastifyRequest } from 'fastify';
import { Knex } from 'knex';
import { Model } from 'objection';
import { errors, types } from '@truck-parking/tp-api';
import DBParkingEvent from '../models/db/DBParkingEvent';
import DBVehicleBan from '../models/db/DBVehicleBan';
import env from '../env';
import { userExists } from './common/user';

const getVehicleBan = async (trx: Knex.Transaction, licensePlate: string): Promise<DBVehicleBan[]> => DBVehicleBan
  .query(trx)
  .where('licensePlate', licensePlate)
  .where('startDateTime', '<=', Model.fn.now())
  .where('endDateTime', '>', Model.fn.now())
  .orderBy('endDateTime', 'desc');

/**
 * This handler retrieves a list of license plates of recent vehicles driven in by the user.
 * Returns the license plates events in `types.RecentVehicles` form on success.
 */
// eslint-disable-next-line import/prefer-default-export
export const getRecentVehicles = async (
  request: FastifyRequest<{ Params: types.UserID }>,
  response: FastifyReply,
): Promise<types.RecentVehicles | types.Error> => {
  // User must exist
  if (!(await userExists(request))) {
    response.code(errors.userNotFound.statusCode);
    return errors.userNotFound;
  }

  // Query the database for all completed parking events for the given user
  const licensePlates = (await DBParkingEvent.query(request.trx)
    .distinct('licensePlate')
    .where('userID', request.params.userID)
    .orderBy('startDateTime', 'desc')
    .limit(env.application.recentVehiclesLimit))
    .map((p) => p.licensePlate);

  const recentVehicles = await Promise.all(licensePlates.map(async (lp) => {
    const bans = await getVehicleBan(request.trx, lp);

    return {
      licensePlate: lp,
      bans,
    };
  }));

  response.code(200);

  return {
    recentVehicles,
  };
};
