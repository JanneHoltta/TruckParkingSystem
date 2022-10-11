import { Model } from 'objection';
import { Knex } from 'knex';
import DBParkingEvent from '../../models/db/DBParkingEvent';
import env from '../../env';

/**
 * Returns the number of free parking spaces
 */
// eslint-disable-next-line import/prefer-default-export
export const getFreeParkingSpacesCount = async (trx: Knex.Transaction): Promise<number> => (
  Math.max(0, (env.application.parkingSpacesCount
    - ((await DBParkingEvent.query(trx)
      .select(Model.raw('COUNT(ID)').as('usedParkingSpacesCount'))
      .where('endDateTime', null))[0] as (DBParkingEvent & { usedParkingSpacesCount: number }))
      .usedParkingSpacesCount))
);
