import {
  conflictError,
  forbiddenError,
  notFoundError,
  serviceUnavailableError,
  unauthorizedError,
  internalServerError,
} from './generators';
import { ParkingStartError, ParkingEndError } from '../enums';
import * as types from '../types';

// Internal errors
export const invalidAPIKey = unauthorizedError('API key missing or invalid');
export const invalidSessionToken = unauthorizedError('invalid session token');
export const invalidServerResponse = serviceUnavailableError('invalid response from server');
export const genericInternalError = internalServerError;

// Authentication errors
export const invalidCredentials = forbiddenError('invalid credentials');

// User errors
export const userNotFound = notFoundError('user not found');
export const userAlreadyExists = conflictError('user already exists');
export const emailAlreadyInUse = conflictError('email address already in use');
export const resetPasswordConflict = conflictError('email and confirmation code mismatch or code too old');

// Parking event errors
export const parkingEventNotFound = notFoundError('parking event not found');
export const parkingEventAlreadyExists = conflictError('parking event already exists');
export const noCurrentParkingEvent = conflictError('no current parking event');
export const cannotStartParkingEvent = (reason: ParkingStartError): types.ParkingStartError => ({
  ...conflictError('cannot start parking event'),
  reason,
});
export const cannotEndParkingEvent = (reason: ParkingEndError): types.ParkingEndError => ({
  ...conflictError('cannot end parking event'),
  reason,
});
