import { FastifyInstance } from 'fastify';
import { schemas, types } from '@truck-parking/tp-api';
import { login } from './handlers/login';
import { addSessionHook, SessionConfig } from './session';
import { logout } from './handlers/logout';
import { signup } from './handlers/signup';
import {
  endCurrentParkingEvent,
  getCurrentParkingEvent,
  getFreeParkingSpaces,
  getParkingEvent,
  getParkingEvents,
  postParkingEvents,
} from './handlers/parkingEvents';
import { getRecentVehicles } from './handlers/recentVehicles';
import {
  getUser,
  patchUser,
  resetPassword,
  sendConfirmationCode,
} from './handlers/user';
import { getBan } from './handlers/ban';
import { getStatus } from './handlers/status';

// Error response ranges that are also used by Fastify's validation
export const errorResponses = {
  '4XX': schemas.error,
  '5XX': schemas.error,
};

export const routesPlugin = async (fastify: FastifyInstance, config: SessionConfig): Promise<void> => {
  fastify.post(
    '/signup',
    {
      schema: {
        body: schemas.signup,
        response: {
          ...errorResponses,
          204: {},
        },
      },
    },
    signup(config),
  );

  fastify.post<{ Body: types.Login }>(
    '/login',
    {
      schema: {
        body: schemas.login,
        response: {
          ...errorResponses,
          204: {},
        },
      },
    },
    login(config),
  );

  fastify.post(
    '/logout',
    {
      schema: {
        response: {
          204: {},
        },
      },
    },
    logout,
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

export const sessionRoutesPlugin = async (fastify: FastifyInstance, config: SessionConfig): Promise<void> => {
  addSessionHook(config, fastify);

  fastify.get(
    '/user',
    {
      schema: {
        response: {
          ...errorResponses,
          200: schemas.user,
        },
      },
    },
    getUser,
  );

  fastify.patch<{ Body: types.PersonalInfoUpdate }>(
    '/user',
    {
      schema: {
        response: {
          ...errorResponses,
          200: schemas.user,
        },
      },
    },
    patchUser,
  );

  fastify.get(
    '/status',
    {
      schema: {
        response: {
          204: schemas.statusNoOp,
        },
      },
    },
    getStatus,
  );

  fastify.get(
    '/ban',
    {
      schema: {
        response: {
          ...errorResponses,
          200: schemas.currentBans,
        },
      },
    },
    getBan,
  );

  fastify.get(
    '/parkingEvents',
    {
      schema: {
        response: {
          ...errorResponses,
          200: schemas.parkingEventHistory,
        },
      },
    },
    getParkingEvents,
  );

  fastify.post<{ Body: types.StartParkingEvent }>(
    '/parkingEvents',
    {
      schema: {
        body: schemas.startParkingEvent,
        response: {
          ...errorResponses,
          201: schemas.parkingEvent,
        },
      },
    },
    postParkingEvents,
  );

  fastify.get<{ Params: types.ParkingEventID }>(
    '/parkingEvents/:parkingEventID',
    {
      schema: {
        params: schemas.parkingEventID,
        response: {
          ...errorResponses,
          200: schemas.parkingEvent,
        },
      },
    },
    getParkingEvent,
  );

  fastify.get(
    '/parkingEvents/current',
    {
      schema: {
        response: {
          ...errorResponses,
          200: schemas.parkingEvent,
          204: schemas.noCurrentParkingEvent,
        },
      },
    },
    getCurrentParkingEvent,
  );

  fastify.patch(
    '/parkingEvents/current/end',
    {
      schema: {
        response: {
          ...errorResponses,
          200: schemas.parkingEvent,
        },
      },
    },
    endCurrentParkingEvent,
  );

  fastify.get(
    '/recentVehicles',
    {
      schema: {
        response: {
          ...errorResponses,
          200: schemas.recentVehicles,
        },
      },
    },
    getRecentVehicles,
  );
};
