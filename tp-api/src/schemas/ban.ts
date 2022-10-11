import { Type } from '@sinclair/typebox';
import { dateTime, uuid } from '../options/string';
import { userID } from './user';

/**
 * Unique identifier type used to look up bans for a user when using path parameters.
 */
export const banID = Type.Intersect([
  userID,
  Type.Object({
    banID: Type.String({ ...uuid, description: 'unique identifier of a ban' }),
  }),
]);

/**
 * Describes a ban entry used to track banned users. Used as the response
 * body of `/ban` endpoint queries in both the Backend and the Server.
 */
export const ban = Type.Object({
  ID: Type.String({ ...uuid, description: 'unique identifier of the ban' }),
  reason: Type.String({
    description: 'Descriptive reason for the ban',
    example: 'Drove through the entrance gate.',
    maxLength: 65535,
  }),
  startDateTime: Type.String({ ...dateTime, description: 'start timestamp' }),
  endDateTime: Type.String({ ...dateTime, description: 'end timestamp' }),
});

/**
 * Defines the format of a new ban.
 */
export const newBan = Type.Intersect([
  Type.Omit(ban, ['ID']),
  Type.Object({
    userID: Type.String({ ...uuid, description: 'identifier of the banned user' }),
  }),
]);

/**
 * A list of bans that is used when retrieving user's current bans.
 */
export const currentBans = Type.Object({
  currentBans: Type.Array(ban, {
    description: 'a list of user\'s current bans',
  }),
});

/**
 * Used by the Server to store ban records in the database.
 */
export const dbBan = Type.Intersect([
  ban,
  Type.Object({
    userID: Type.String({ ...uuid, description: 'identifier of the banned user' }),
  }),
]);

/**
 * A list of all bans.
 */
export const bans = Type.Object({
  bans: Type.Array(dbBan, {
    description: 'a list of all bans',
  }),
});
