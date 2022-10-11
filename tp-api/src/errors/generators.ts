import * as types from '../types/error';

export const unauthorizedError = (message: string): types.Error => ({
  statusCode: 401,
  error: 'Unauthorized',
  message,
});

export const forbiddenError = (message: string): types.Error => ({
  statusCode: 403,
  error: 'Forbidden',
  message,
});

export const notFoundError = (message: string): types.Error => ({
  statusCode: 404,
  error: 'Not Found',
  message,
});

export const conflictError = (message: string): types.Error => ({
  statusCode: 409,
  error: 'Conflict',
  message,
});

export const internalServerError = (message: string): types.Error => ({
  statusCode: 500,
  error: 'Internal Server Error',
  message,
});

export const serviceUnavailableError = (message: string): types.Error => ({
  statusCode: 503,
  error: 'Service Unavailable',
  message,
});
