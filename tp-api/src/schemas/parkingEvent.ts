import { Type } from '@sinclair/typebox';
import { dateTime, nonBlank, uuid } from '../options/string';
import { userID } from './user';

/**
 * Defines the format of a vehicle ban.
 */
const vehicleBan = Type.Object({
  reason: Type.String({
    description: 'descriptive reason for the ban',
    example: 'Drove through the entrance gate.',
    maxLength: 65535,
  }),
  startDateTime: Type.String({ ...dateTime, description: 'start timestamp' }),
  endDateTime: Type.String({ ...dateTime, description: 'end timestamp' }),
});

/**
 * Defines the format used for storing and processing vehicle license plates.
 */
export const licensePlate = Type.String({
  ...nonBlank,
  description: 'licence plate',
  example: 'ABC-123',
  minLength: 1,
  maxLength: 16,
});

/**
 * Unique identifier type used to look up licensePlates when using path parameters.
 */
export const paramLicensePlate = Type.Object({
  licensePlate,
});

/**
 * Unique identifier type used to look up dates when using path parameters.
 */
export const parkingEventDateRange = Type.Object({
  startDateTime: Type.String({ ...dateTime, description: 'start timestamp' }),
  endDateTime: Type.String({ ...dateTime, description: 'end timestamp' }),
});

/**
 * Defines the format of a new vehicle ban.
 */
export const newVehicleBan = Type.Intersect([
  vehicleBan,
  Type.Object({
    licensePlate,
  }),
]);

/**
 * Defines the format used for recentVehicles object.
 */
export const recentVehicle = Type.Object({
  licensePlate,
  bans: Type.Array(vehicleBan, {
    description: 'a list of the vehicle\'s current bans',
  }),
});

/**
 * A list of license plates that is used as the response body of the `/recentVehicles` endpoint.
 * Contains a list of current bans for each vehicle.
 */
export const recentVehicles = Type.Object({
  recentVehicles: Type.Array(recentVehicle, {
    description: 'a list of recent vehicles with possible ban details',
  }),
});

/**
 * Defines the request body used to start a new parking event.
 */
export const startParkingEvent = Type.Object({
  licensePlate,
});

/**
 * Unique identifier type used to look up parking events when using path parameters.
 */
export const parkingEventID = Type.Object({
  parkingEventID: Type.String({ ...uuid, description: 'unique identifier of a parkingEvent' }),
});

/**
 * Unique identifier type used to look up parking events for a user when using path parameters.
 */
export const userParkingEventID = Type.Intersect([
  userID,
  parkingEventID,
]);

/**
 * Defines the format used for parking events when communicating with them with the Frontend.
 */
export const parkingEvent = Type.Object({
  licensePlate,
  ID: Type.String({ ...uuid, description: 'unique identifier of the parking event' }),
  startDateTime: Type.String({ ...dateTime, description: 'start time of the parking event' }),
  endDateTime: Type.Union(
    [
      Type.String({ ...dateTime, description: 'end time of the parking event' }),
      Type.Null({ description: 'parking event not ended' }),
    ],
    {
      description: 'end time of the parking event',
      example: null,
    },
  ),
  expiryDateTime: Type.String({ ...dateTime, description: 'expiry time of the parking event' }),
});

/**
 * A list of parking events that is used when retrieving the parking event history.
 */
export const parkingEventHistory = Type.Object({
  parkingEvents: Type.Array(parkingEvent, {
    description: 'a list of parking events',
  }),
});

/**
 * The database representation of a parking event, used by the Server component.
 */
export const dbParkingEvent = Type.Intersect([
  parkingEvent,
  Type.Object({
    userID: Type.String({ ...uuid, description: 'id of the user who is parking' }),
    licensePlateMatches: Type.Boolean({
      description: 'does the licence plate match with CCTV feed',
      example: false,
    }),
  }),
]);

/**
 * Number of free parking spaces.
 */
export const freeParkingSpaces = Type.Object({
  freeParkingSpaces: Type.Number({
    description: 'number of free parking spaces',
  }),
});

/**
 * A response body type to indicate that there is no current parking event
 */
export const noCurrentParkingEvent = Type.Null({
  description: 'no ongoing parking event',
});

/**
 * Used by the Server to store vehicle ban records in the database.
 */
export const dbVehicleBan = Type.Intersect([
  vehicleBan,
  Type.Object({
    ID: Type.String({ ...uuid, description: 'identifier of the vehicle ban' }),
    licensePlate,
  }),
]);

/**
 * A list of all vehicle bans.
 */
export const vehicleBans = Type.Object({
  bans: Type.Array(dbVehicleBan, {
    description: 'a list of all vehicle bans',
  }),
});
