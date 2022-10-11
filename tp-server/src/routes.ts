import { FastifyInstance } from 'fastify';
import { schemas, types } from '@truck-parking/tp-api';
import { authenticate } from './handlers/authentication';
import {
  getUser, getUserBan, patchUser, postUser, resetPassword, sendConfirmationCode,
} from './handlers/user';
import {
  endCurrentParkingEvent,
  getCurrentParkingEvent,
  getFreeParkingSpaces,
  getParkingEvent,
  getParkingEvents,
  initiateParkingEvent,
} from './handlers/parkingEvents';
import { getRecentVehicles } from './handlers/recentVehicles';
import { addUserStatusHook } from './hooks/status';
import { getStatus } from './handlers/status';

const errorResponses = {
  '4XX': schemas.error,
  '5XX': schemas.error,
};

export const routesPlugin = async (fastify: FastifyInstance): Promise<void> => {
  fastify.post<{ Body: types.Login }>(
    '/authenticate',
    {
      schema: {
        body: schemas.login,
        response: {
          ...errorResponses,
          200: schemas.authenticated,
        },
      },
    },
    authenticate,
  );

  fastify.get(
    '/freeParkingSpaces',
    {
      schema: {
        response: {
          ...errorResponses,
          200: schemas.freeParkingSpaces,
        },
      },
    },
    getFreeParkingSpaces,
  );

  fastify.post<{ Body: types.ConfirmationCodeRequest }>(
    '/sendConfirmationCode',
    {
      schema: {
        body: schemas.confirmationCodeRequest,
        response: {
          ...errorResponses,
          204: schemas.confirmationCodeSent,
        },
      },
    },
    sendConfirmationCode,
  );

  fastify.post<{ Body: types.ResetPassword }>(
    '/resetPassword',
    {
      schema: {
        body: schemas.resetPassword,
        response: {
          ...errorResponses,
          204: schemas.resetPasswordDone,
        },
      },
    },
    resetPassword,
  );
};

export const userRoutesPlugin = async (fastify: FastifyInstance): Promise<void> => {
  addUserStatusHook(fastify);

  fastify.get<{ Params: types.UserID }>(
    '/user/:userID',
    {
      schema: {
        params: schemas.userID,
        response: {
          ...errorResponses,
          200: schemas.user,
        },
      },
    },
    getUser,
  );

  fastify.post<{ Body: types.Signup }>(
    '/user',
    {
      schema: {
        body: schemas.signup,
        response: {
          ...errorResponses,
          201: schemas.user,
        },
      },
    },
    postUser,
  );

  fastify.patch<{ Body: types.PersonalInfoUpdate, Params: types.UserID }>(
    '/user/:userID',
    {
      schema: {
        body: schemas.personalInfoUpdate,
        response: {
          ...errorResponses,
          200: schemas.user,
        },
      },
    },
    patchUser,
  );

  fastify.get<{ Params: types.UserID }>(
    '/user/:userID/status',
    {
      schema: {
        params: schemas.userID,
        response: {
          ...errorResponses,
          204: schemas.statusNoOp,
        },
      },
    },
    getStatus,
  );

  fastify.get<{ Params: types.UserID }>(
    '/user/:userID/ban',
    {
      schema: {
        params: schemas.userID,
        response: {
          ...errorResponses,
          200: schemas.currentBans,
        },
      },
    },
    getUserBan,
  );

  fastify.get<{ Params: types.UserID }>(
    '/user/:userID/parkingEvents',
    {
      schema: {
        params: schemas.userID,
        response: {
          ...errorResponses,
          200: schemas.parkingEventHistory,
        },
      },
    },
    getParkingEvents,
  );

  fastify.post<{ Body: types.StartParkingEvent, Params: types.UserID }>(
    '/user/:userID/parkingEvents',
    {
      schema: {
        body: schemas.startParkingEvent,
        params: schemas.userID,
        response: {
          ...errorResponses,
          201: schemas.parkingEvent,
          409: schemas.parkingStartError,
        },
      },
    },
    initiateParkingEvent,
  );

  fastify.get<{ Params: types.UserParkingEventID }>(
    '/user/:userID/parkingEvents/:parkingEventID',
    {
      schema: {
        params: schemas.userParkingEventID,
        response: {
          ...errorResponses,
          200: schemas.parkingEvent,
        },
      },
    },
    getParkingEvent,
  );

  fastify.get<{ Params: types.UserID }>(
    '/user/:userID/parkingEvents/current',
    {
      schema: {
        params: schemas.userID,
        response: {
          ...errorResponses,
          200: schemas.parkingEvent,
          204: schemas.noCurrentParkingEvent,
        },
      },
    },
    getCurrentParkingEvent,
  );

  fastify.patch<{ Params: types.UserID }>(
    '/user/:userID/parkingEvents/current/end',
    {
      schema: {
        params: schemas.userID,
        response: {
          ...errorResponses,
          200: schemas.parkingEvent,
        },
      },
    },
    endCurrentParkingEvent,
  );

  fastify.get<{ Params: types.UserID }>(
    '/user/:userID/recentVehicles',
    {
      schema: {
        params: schemas.userID,
        response: {
          ...errorResponses,
          200: schemas.recentVehicles,
        },
      },
    },
    getRecentVehicles,
  );
};
