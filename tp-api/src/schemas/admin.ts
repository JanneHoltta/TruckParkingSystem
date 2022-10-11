import { Type } from '@sinclair/typebox';
import { UserStatus } from '../enums';
import { uuid } from '../options/string';
import { ban } from './ban';
import { licensePlate, dbParkingEvent } from './parkingEvent';
import { user } from './user';

/**
 * Further extends {@link user} to make it have all fields necessary for admin UI.
 */
export const adminUser = Type.Intersect([
  user,
  Type.Object({
    status: Type.Enum(UserStatus, {
      description: 'current status of the user',
      example: UserStatus.Parking,
    }),
    bans: Type.Array(ban, {
      description: 'a list of user\'s bans',
    }),
    vehicles: Type.Array(licensePlate, {
      description: 'a list of user\'s past vehicles',
    }),
  }),
]);

/**
 * Defines the format used for recentVehicles object.
 */
export const adminUsers = Type.Object({
  users: Type.Array(adminUser, {
    description: 'a list of users for admin UI',
  }),
});

/**
 * A list of parking events that is used when retrieving the parking event history.
 */
export const adminParkingEventHistory = Type.Object({
  parkingEvents: Type.Array(dbParkingEvent, {
    description: 'a list of all parking events',
  }),
});

/**
 * Unique identifier type used to look up bans when using path parameters.
 */
export const adminBanID = Type.Object({
  banID: Type.String({ ...uuid, description: 'unique identifier of a ban' }),
});

/**
 * Unique identifier type used to look up vehicle bans when using path parameters.
 */
export const adminVehicleBanID = Type.Object({
  banID: Type.String({ ...uuid, description: 'unique identifier of a vehicle ban' }),
});

/**
 * An empty response body type for deleting a ban or vehicle ban.
 */
// eslint-disable-next-line import/prefer-default-export
export const banDeleted = Type.Null({
  description: 'ban deleted',
});
