import { FastifyReply, FastifyRequest } from 'fastify';
import { Model } from 'objection';
import { errors, types } from '@truck-parking/tp-api';
import * as argon2 from 'argon2';
import axios from 'axios';
import { randomUUID, randomInt } from 'crypto';
import DBUser from '../models/db/DBUser';
import DBBannedUsers from '../models/db/DBBannedUsers';
import { userExists } from './common/user';
import env from '../env';

/**
 * Helper function for trimming personal info data
 * @param input
 */
// eslint-disable-next-line import/prefer-default-export
const trimPersonalInfo = <T extends { firstName?: string, lastName?: string, company?: string }>(input: T): T => ({
  ...input,
  firstName: input.firstName?.trim(),
  lastName: input.lastName?.trim(),
  company: input.company?.trim(),
});

/**
 * This handler creates a new user based on the given personal information and stores it in the database.
 * On success, returns 201 and the newly created user. Fails if the user's email is not unique (i.e. the
 * user already exists).
 */
export const postUser = async (
  request: FastifyRequest<{ Body: types.Signup }>,
  response: FastifyReply,
): Promise<types.User | types.Error> => {
  // Extract the personal information from the request
  const personalInfo = trimPersonalInfo(request.body);

  // Check that the given email address is unique
  const existingUser = await DBUser.query(request.trx).where('emailAddress', personalInfo.emailAddress).first();
  if (existingUser) {
    // Respond with an error if the user already exists
    response.code(errors.userAlreadyExists.statusCode);
    return errors.userAlreadyExists;
  }

  // Hash the user's password
  const passwordHash = await argon2.hash(personalInfo.password);
  delete personalInfo.password; // The plain-text password is not stored

  const userID = randomUUID(); // Generate a new random UUID for the user

  // Construct the new user and insert it into the database
  await DBUser.query(request.trx).insert({
    ...personalInfo,
    ID: userID,
    passwordHash,
  });

  // Fetch the newly-created user (insertAndFetch does not work)
  const newUser = await DBUser.query(request.trx).findById(userID);

  // Define the userID param for the user status hook, this is a bit of a hack
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  request.params.userID = newUser.ID;

  // Return the newly generated user
  response.code(201);
  return newUser;
};

/**
 * This handler retrieves basic information for the given user. On success, returns 200 with the user.
 */
export const getUser = async (
  request: FastifyRequest<{ Params: types.UserID }>,
  response: FastifyReply,
): Promise<types.User | types.Error> => {
  const user = await DBUser.query(request.trx).findById(request.params.userID);
  if (!user) {
    response.code(errors.userNotFound.statusCode);
    return errors.userNotFound;
  }

  response.code(200);
  return user;
};

/**
 * This handler receives (partial) updated personal information and stores it
 * in the database. On success, returns 200 with the updated user information.
 */
export const patchUser = async (
  request: FastifyRequest<{ Body: types.PersonalInfoUpdate, Params: types.UserID }>,
  response: FastifyReply,
): Promise<types.User | types.Error> => {
  // User must exist
  if (!(await userExists(request))) {
    response.code(errors.userNotFound.statusCode);
    return errors.userNotFound;
  }

  // Extract the personal information from the request
  const personalInfo = trimPersonalInfo(request.body) as types.PersonalInfoUpdate & { passwordHash: string };

  // Check that the email address is unique if it is given
  if (personalInfo.emailAddress) {
    const existingUser = await DBUser.query(request.trx)
      .where('emailAddress', personalInfo.emailAddress)
      .whereNot('ID', request.params.userID) // Don't consider the requesting user
      .first();
    if (existingUser) {
      // Respond with an error if the email is already in use
      response.code(errors.emailAlreadyInUse.statusCode);
      return errors.emailAlreadyInUse;
    }
  }

  if (personalInfo.password) {
    // Hash the user's new password
    personalInfo.passwordHash = await argon2.hash(personalInfo.password);
    delete personalInfo.password; // The plain-text password is not stored
  }

  // Store updated user details
  await DBUser.query(request.trx).patch(personalInfo).where('ID', request.params.userID);

  // Fetch the updated user (patchAndFetch does not work)
  const updatedUser = await DBUser.query(request.trx).findById(request.params.userID);

  response.code(200);
  return updatedUser;
};

/**
 * This handler retrieves the user's current ban status.
 * On success, returns 200 with a list of bans.
 */
export const getUserBan = async (
  request: FastifyRequest<{ Params: types.UserID }>,
  response: FastifyReply,
): Promise<types.CurrentBans | types.Error> => {
  const user = await DBUser.query(request.trx).findById(request.params.userID);
  if (!user) {
    response.code(errors.userNotFound.statusCode);
    return errors.userNotFound;
  }

  // Retrieve any active bans from the database, the longest one first
  const currentBans = await DBBannedUsers.query(request.trx)
    .where('userID', request.params.userID)
    .where('startDateTime', '<=', Model.fn.now())
    .where('endDateTime', '>', Model.fn.now())
    .orderBy('endDateTime', 'desc');

  response.code(200);
  return {
    currentBans,
  };
};

/**
 * This handler generates a confirmation code for password reset, sends it to the user
 * and writes it to the database along with its creation time.
 * On success, returns 204.
 */
export const sendConfirmationCode = async (
  request: FastifyRequest<{ Body: types.ConfirmationCodeRequest }>,
  response: FastifyReply,
): Promise<types.ConfirmationCodeSent | types.Error> => {
  // Find user by email
  const user = await DBUser.query(request.trx)
    .where('emailAddress', request.body.emailAddress)
    .first();

  // User must exist
  if (!user) {
    response.code(204);

    // types.ResetPasswordDone is technically equivalent to null, but returning null from a handler is
    // currently broken in Fastify. Returning undefined has the same effect, but it doesn't break Fastify.
    return undefined;
  }

  // Generate confirmation code
  const confirmationCodeToDB = {
    confirmationCode: randomInt(100000, 1000000).toString(),
    confirmationCodeCreateDateTime: Model.fn.now(),
  };

  // Write confirmation code and code creation time to database
  await DBUser.query(request.trx).patch(confirmationCodeToDB).where('ID', user.ID);

  // Send confirmation code to user and wait until it has been sent
  const message = `Confirmation code: ${confirmationCodeToDB.confirmationCode}`;

  const sendResult = (await axios.post(`${env.server.smsServerUri}/send`,
    new URLSearchParams(`token=${env.server.smsToken}`
      + `&numbers=${encodeURIComponent(user.phoneNumber)}&message=${message}`),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    })
  ).data;

  const messageBatchId = sendResult.id;

  const startTime = Date.now();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (Date.now() - startTime > 60 * 1000) {
      const timeoutError = errors.genericInternalError('confirmation code send timeout');
      response.code(timeoutError.statusCode);
      return timeoutError;
    }

    // eslint-disable-next-line no-await-in-loop
    const messageStatusResult = (await axios.get(`${env.server.smsServerUri}/status`
      + `?token=${env.server.smsToken}&id=${messageBatchId}`)).data;

    if (messageStatusResult.allSent) {
      break;
    }

    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  response.code(204);

  // types.ResetPasswordDone is technically equivalent to null, but returning null from a handler is
  // currently broken in Fastify. Returning undefined has the same effect, but it doesn't break Fastify.
  return undefined;
};

/**
 * This handler receives a new password along with the confirmation code and stores it
 * in the database.
 * On success, returns 204.
 * On error, returns 409 (email and confirmation code mismatch or code too old).
 */
export const resetPassword = async (
  request: FastifyRequest<{ Body: types.ResetPassword }>,
  response: FastifyReply,
): Promise<types.ResetPasswordDone | types.Error> => {
  // Find user by email and check confirmation code and its validity
  const user = await DBUser.query(request.trx)
    .where('emailAddress', request.body.emailAddress)
    .where('confirmationCode', request.body.confirmationCode)
    .where(Model.raw('confirmationCodeCreateDateTime + INTERVAL ? SECOND',
      env.application.confirmationCodeLifetime), '>=', Model.fn.now())
    .first();

  // User must exist, the confirmation code must match with the user email address, and the code must not be too old
  if (!user) {
    response.code(errors.resetPasswordConflict.statusCode);
    return errors.resetPasswordConflict;
  }

  const newPassword = {
    passwordHash: await argon2.hash(request.body.password),
    confirmationCode: null as string,
    confirmationCodeCreateDateTime: null as string,
  };

  // Store updated user details
  await DBUser.query(request.trx).patch(newPassword).where('ID', user.ID);

  response.code(204);

  // types.ResetPasswordDone is technically equivalent to null, but returning null from a handler is
  // currently broken in Fastify. Returning undefined has the same effect, but it doesn't break Fastify.
  return undefined;
};
