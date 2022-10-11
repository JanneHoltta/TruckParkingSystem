import { types } from '@truck-parking/tp-api';
import { FastifyReply, FastifyRequest } from 'fastify';
import axios from 'axios';
import { checkResponse, serverQuery } from '../server';

/**
 * Handler for retrieving the parking event history for the user
 * @param request
 * @param response
 */
export const getParkingEvents = async (
  request: FastifyRequest,
  response: FastifyReply,
): Promise<types.ParkingEventHistory | types.Error> => serverQuery(
  response,
  async () => axios.get(`/user/${request.userID}/parkingEvents`)
    .then(checkResponse([200], [404]))
    .then((serverResponse) => ({
      headers: serverResponse.headers, code: serverResponse.status, body: serverResponse.data,
    })),
);

/**
 * Handler for starting a new parking event for the user
 * @param request
 * @param response
 */
// eslint-disable-next-line import/prefer-default-export
export const postParkingEvents = async (
  request: FastifyRequest<{ Body: types.StartParkingEvent }>,
  response: FastifyReply,
): Promise<types.ParkingEvent | types.Error> => serverQuery(
  response,
  async () => axios.post(`/user/${request.userID}/parkingEvents`, request.body)
    .then(checkResponse([201], [404, 409]))
    .then((serverResponse) => ({
      headers: serverResponse.headers, code: serverResponse.status, body: serverResponse.data,
    })),
);

/**
 * Handler for retrieving a single parking event
 * @param request
 * @param response
 */
export const getParkingEvent = async (
  request: FastifyRequest<{ Params: types.ParkingEventID }>,
  response: FastifyReply,
): Promise<types.ParkingEvent | types.Error> => serverQuery(
  response,
  async () => axios.get(`/user/${request.userID}/parkingEvents/${request.params.parkingEventID}`)
    .then(checkResponse([200], [404]))
    .then((serverResponse) => ({
      headers: serverResponse.headers, code: serverResponse.status, body: serverResponse.data,
    })),
);

/**
 * Handler for retrieving the current parking event for the user
 * @param request
 * @param response
 */
export const getCurrentParkingEvent = async (
  request: FastifyRequest,
  response: FastifyReply,
): Promise<types.ParkingEvent | types.NoCurrentParkingEvent | types.Error> => serverQuery(
  response,
  async () => axios.get(`/user/${request.userID}/parkingEvents/current`)
    .then(checkResponse([200, 204], [404]))
    .then((serverResponse) => ({
      headers: serverResponse.headers, code: serverResponse.status, body: serverResponse.data,
    })),
);

/**
 * Handler for ending the current parking event for the user
 * @param request
 * @param response
 */
export const endCurrentParkingEvent = async (
  request: FastifyRequest,
  response: FastifyReply,
): Promise<types.ParkingEvent | types.Error> => serverQuery(
  response,
  async () => axios.patch(`/user/${request.userID}/parkingEvents/current/end`, {})
    .then(checkResponse([200], [404, 409]))
    .then((serverResponse) => ({
      headers: serverResponse.headers, code: serverResponse.status, body: serverResponse.data,
    })),
);

/**
 * Handler for fetching current number of free parking spaces
 * @param request
 * @param response
 */
export const getFreeParkingSpaces = async (
  request: FastifyRequest,
  response: FastifyReply,
): Promise<types.FreeParkingSpaces | types.Error> => serverQuery(
  response,
  async () => axios.get('/freeParkingSpaces')
    .then(checkResponse([200]))
    .then((serverResponse) => ({
      headers: serverResponse.headers, code: serverResponse.status, body: serverResponse.data,
    })),
);
