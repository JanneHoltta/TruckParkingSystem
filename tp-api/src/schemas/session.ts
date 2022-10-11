import { Type } from '@sinclair/typebox';
import { password, fullPersonalInfo } from './personalInfo';
import { uuid } from '../options/string';

/**
 * Used by the signup endpoints to track user input required for creation
 * of a new user. This is essentially the same as {@link fullPersonalInfo}.
 */
export const signup = fullPersonalInfo;

/**
 * Used by the login endpoints to receive the login information of some user.
 */
export const login = Type.Object({
  username: Type.String({
    description: 'username string',
    example: 'john@example.com',
    minLength: 1,
  }),
  password,
});

/**
 * Used by the Server to return a user ID to the Backend upon successful user authentication.
 */
export const authenticated = Type.Object({
  userID: Type.String({ ...uuid, description: 'unique id' }),
});

/**
 * A response body type to indicate that a session operation (signup/login/logout) succeeded
 */
export const sessionOperationSuccess = Type.Null({
  description: 'session operation succeeded',
});
