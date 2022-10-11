import { types } from '@truck-parking/tp-api';
import { FastifyReply, FastifyRequest } from 'fastify';
import axios from 'axios';
import { checkResponse, serverQuery } from '../server';

/**
 * Handler for retrieving the details and some metadata for the user
 * @param request
 * @param response
 */
export const getUser = async (
  request: FastifyRequest,
  response: FastifyReply,
): Promise<types.User | types.Error> => serverQuery(
  response,
  async () => axios.get(`/user/${request.userID}`)
    .then(checkResponse([200], [404]))
    .then((serverResponse) => ({
      headers: serverResponse.headers, code: serverResponse.status, body: serverResponse.data,
    })),
);

/**
 * Handler for updating the personal information for the user
 * @param request
 * @param response
 */
export const patchUser = async (
  request: FastifyRequest<{ Body: types.PersonalInfoUpdate }>,
  response: FastifyReply,
): Promise<types.PersonalInfoUpdate | types.Error> => serverQuery(
  response,
  async () => axios.patch(`/user/${request.userID}`, request.body)
    .then(checkResponse([200], [404, 409]))
    .then((serverResponse) => ({
      headers: serverResponse.headers, code: serverResponse.status, body: serverResponse.data,
    })),
);

/**
 * Handler for sending the confirmation code for password reset
 * @param request
 * @param response
 */
export const sendConfirmationCode = async (
  request: FastifyRequest<{ Body: types.ConfirmationCodeRequest }>,
  response: FastifyReply,
): Promise<types.ConfirmationCodeSent | types.Error> => serverQuery(
  response,
  async () => axios.post('/sendConfirmationCode', request.body)
    .then(checkResponse([204]))
    .then((serverResponse) => ({
      headers: serverResponse.headers, code: serverResponse.status, body: serverResponse.data,
    })),
);

/**
 * Handler for resetting user password
 * @param request
 * @param response
 */
export const resetPassword = async (
  request: FastifyRequest<{ Body: types.ResetPassword }>,
  response: FastifyReply,
): Promise<types.ResetPasswordDone | types.Error> => serverQuery(
  response,
  async () => axios.post('/resetPassword', request.body)
    .then(checkResponse([204], [409]))
    .then((serverResponse) => ({
      headers: serverResponse.headers, code: serverResponse.status, body: serverResponse.data,
    })),
);
