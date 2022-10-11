import { Knex } from 'knex';
import { enums, types } from '@truck-parking/tp-api';
import env from '../../env';
import UserStatus from '../../models/db/UserStatus';

/**
 * Helper function for creating a UserStatus object
 */
const statusFrom = (status: enums.UserStatus, date: Date): types.UserStatus => ({
  status,
  nextParkingAllowed: date.toISOString(),
});

/**
 * A helper that parses the current status and nextParkingAllowed timestamp for the given user
 *
 * @param userID  the ID of the user to retrieve the status for
 * @param trx     the knex transaction to query the database with
 */
// eslint-disable-next-line import/prefer-default-export
export const userStatus = async (
  userID: string,
  trx: Knex.Transaction,
): Promise<types.UserStatus | undefined> => {
  const status = await UserStatus.query(trx).findById(userID);
  if (!status) { return undefined; } // User doesn't exist, can't retrieve status

  // Test if the user has a non-null current ban end timestamp, i.e. if they're banned
  if (status.banEnd) {
    return statusFrom(enums.UserStatus.Banned, status.banEnd);
  }

  // Test if the user has a non-null expiry timestamp for a running parking event, i.e. if they're parking
  if (status.parkingExpiry) {
    return statusFrom(
      enums.UserStatus.Parking,
      new Date(status.parkingExpiry.getTime() + env.application.cooldownPeriod * 1000),
    );
  }

  // Test if the user's cooldown time is below the minimum period, i.e. if they're on cooldown
  if (status.cooldownTime < env.application.cooldownPeriod) {
    // Compute the cooldown end timestamp
    const cooldownEnd = (status.parkingEnd?.getTime() || 0) + env.application.cooldownPeriod * 1000;
    return statusFrom(enums.UserStatus.Cooldown, new Date(cooldownEnd));
  }

  // Otherwise, they're idle. The default next parking timestamp is Unix epoch instant 0.
  return statusFrom(enums.UserStatus.Idle, new Date(0));
};
