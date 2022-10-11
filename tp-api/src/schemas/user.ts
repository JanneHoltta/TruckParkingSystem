import { Type } from '@sinclair/typebox';
import { confirmationCode, personalInfo } from './personalInfo';
import { dateTime, uuid } from '../options/string';

/**
 * Unique identifier type used to look up users when using path parameters.
 */
export const userID = Type.Object({
  userID: Type.String({ ...uuid, description: 'unique identifier of a user' }),
});

/**
 * Extends the personal information of a user with a unique ID and some
 * relevant info for the Frontend, such as the last login timestamp.
 */
export const user = Type.Intersect([
  personalInfo,
  Type.Object({
    ID: Type.String({ ...uuid, description: 'unique identifier of the user' }),
    registerDateTime: Type.String({ ...dateTime, description: 'timestamp of profile creation' }),
    lastLoginDateTime: Type.Union(
      [
        Type.String({ ...dateTime, description: 'last login' }),
        Type.Null({
          description: 'user has not logged in yet',
        }),
      ],
      {
        description: 'timestamp of last login',
        example: null,
      },
    ),
  }),
]);

/**
 * Further extends {@link user} to make it have all fields that are stored in the user
 * table in the database. The Server uses the password hash data to verify authenticity,
 * and the confirmation code and code creation time for password reset support.
 */
export const dbUser = Type.Intersect([
  user,
  Type.Object({
    passwordHash: Type.String({
      description: 'argon2 password hash',
      minLength: 95,
      maxLength: 95,
    }),
    confirmationCode,
    confirmationCodeCreateDateTime: Type.String({
      ...dateTime,
      description: 'timestamp of confirmation code creation',
    }),
  }),
]);
