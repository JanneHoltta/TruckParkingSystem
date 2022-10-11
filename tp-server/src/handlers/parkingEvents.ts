import { Model } from 'objection';
import { FastifyReply, FastifyRequest } from 'fastify';
import { randomUUID } from 'crypto';
import { enums, errors, types } from '@truck-parking/tp-api';
import DBParkingEvent from '../models/db/DBParkingEvent';
import { userExists } from './common/user';
import { getFreeParkingSpacesCount } from './common/parkingSpaces';
import env from '../env';
import { userStatus } from './common/status';
import {
  checkEntryGateInductionLoop,
  checkExitGateInductionLoop,
  openEntryGates,
  openExitGates,
} from './common/gateController';
import DBVehicleBan from '../models/db/DBVehicleBan';

/**
 * This handler looks up all (current and past) parking events for the given user.
 * Returns the parking events in `types.ParkingEventHistory` form on success.
 */
export const getParkingEvents = async (
  request: FastifyRequest<{ Params: types.UserID }>,
  response: FastifyReply,
): Promise<types.ParkingEventHistory | types.Error> => {
  // User must exist
  if (!(await userExists(request))) {
    response.code(errors.userNotFound.statusCode);
    return errors.userNotFound;
  }

  // Query the database for all completed parking events for the given user
  const parkingEvents = await DBParkingEvent.query(request.trx)
    .where('userID', request.params.userID)
    .whereNot('endDateTime', null)
    .orderBy('startDateTime', 'desc');

  response.code(200);

  return {
    parkingEvents, // Return the parking events
  };
};

/**
 * This handler looks up a specific parking event by ID.
 * Returns the parking event in `types.ParkingEvent` form on success.
 */
export const getParkingEvent = async (
  request: FastifyRequest<{ Params: types.UserParkingEventID }>,
  response: FastifyReply,
): Promise<types.ParkingEvent | types.Error> => {
  // User must exist
  if (!(await userExists(request))) {
    response.code(errors.userNotFound.statusCode);
    return errors.userNotFound;
  }

  // Query the database for the parking event by ID
  const parkingEvent = await DBParkingEvent.query(request.trx)
    .where('userID', request.params.userID)
    .where('ID', request.params.parkingEventID)
    .orderBy('startDateTime', 'desc')
    .first();

  if (parkingEvent) {
    response.code(200);
    return parkingEvent;
  }

  response.code(errors.parkingEventNotFound.statusCode);
  return errors.parkingEventNotFound;
};

/**
 * This handler finds the current parking event for the given user.
 * In case there is no ongoing parking event for the user, this handler will reply with a 204 response.
 */
export const getCurrentParkingEvent = async (
  request: FastifyRequest<{ Params: types.UserID }>,
  response: FastifyReply,
): Promise<types.ParkingEvent | types.NoCurrentParkingEvent | types.Error> => {
  // User must exist
  if (!(await userExists(request))) {
    response.code(errors.userNotFound.statusCode);
    return errors.userNotFound;
  }

  // Query the database for all completed parking events for the given user
  const parkingEvent = await DBParkingEvent.query(request.trx)
    .where('userID', request.params.userID)
    .where('endDateTime', null)
    .orderBy('startDateTime', 'desc')
    .first();

  if (parkingEvent) {
    response.code(200);
    return parkingEvent;
  }

  response.code(204);

  // types.NoCurrentParkingEvent is technically equivalent to null, but returning null from a handler is
  // currently broken in Fastify. Returning undefined has the same effect, but it doesn't break Fastify.
  return undefined;
};

/**
 * This handler ends the current parking event for the given user.
 * In case there is no ongoing parking event for the user, this handler will reply with a 409 response.
 */
export const endCurrentParkingEvent = async (
  request: FastifyRequest<{ Params: types.UserID }>,
  response: FastifyReply,
): Promise<types.ParkingEvent | types.Error> => {
  // User must exist
  if (!(await userExists(request))) {
    response.code(errors.userNotFound.statusCode);
    return errors.userNotFound;
  }

  // End any active parking event for the user
  const updatedRows = await DBParkingEvent.query(request.trx)
    .where('userID', request.params.userID)
    .where('endDateTime', null)
    .patch({ endDateTime: Model.fn.now() });

  if (!updatedRows) { // No parking events were ended
    // Cannot end a non-existent current parking event
    const error = errors.cannotEndParkingEvent(enums.ParkingEndError.NotParking);
    response.code(error.statusCode);
    return error;
  }

  try {
    // Check if there is a vehicle present at the exit gate
    const vehicleAtGate = await checkExitGateInductionLoop();
    if (!vehicleAtGate) {
      const error = errors.cannotEndParkingEvent(enums.ParkingEndError.NoVehicleAtGate);
      response.code(error.statusCode);
      return error;
    }

    // Open the entry gate
    await openExitGates();
  } catch {
    const error = errors.cannotEndParkingEvent(enums.ParkingEndError.NoReplyFromGate);
    response.code(error.statusCode);
    return error;
  }

  // Query the database for all completed parking events for the given user
  const parkingEvent = await DBParkingEvent.query(request.trx)
    .where('userID', request.params.userID)
    .whereNot('endDateTime', null)
    .orderBy('startDateTime', 'desc')
    .first();

  if (!parkingEvent) {
    // Should never happen. Since patchAndFetch does not work, we need to patch
    // first and then query the updated result. The query can technically fail
    // to find the patched object if the transaction serialization is too lax.
    throw new Error('currently ended parking event was lost');
  }

  // Return the now ended parking event
  response.code(200);
  return parkingEvent;
};

/**
 * This handler parses the rules to initiate a new parking event and initiates it if the rules were complied.
 * Returns the newly created parking event on success. Returns a reason for denying request on rule mismatch.
 */
export const initiateParkingEvent = async (
  request: FastifyRequest<{ Body: types.StartParkingEvent, Params: types.UserID }>,
  response: FastifyReply,
): Promise<types.ParkingEvent | types.Error> => {
  const status = await userStatus(request.params.userID, request.trx);
  if (!status) { // User must exist
    response.code(errors.userNotFound.statusCode);
    return errors.userNotFound;
  }

  if (status.status !== enums.UserStatus.Idle) {
    let reason;

    if (status.status === enums.UserStatus.Banned) reason = enums.ParkingStartError.Banned;
    if (status.status === enums.UserStatus.Cooldown) reason = enums.ParkingStartError.Cooldown;
    if (status.status === enums.UserStatus.Parking) reason = enums.ParkingStartError.AlreadyParking;

    const error = errors.cannotStartParkingEvent(reason);
    response.code(error.statusCode);
    return error;
  }

  // Check if there are free parking spaces available
  const freeParkingSpacesCount = await getFreeParkingSpacesCount(request.trx);
  if (freeParkingSpacesCount === 0) {
    const error = errors.cannotStartParkingEvent(enums.ParkingStartError.AreaFull);
    response.code(error.statusCode);
    return error;
  }

  // Check if the vehicle is banned
  const currentVehicleBans = await DBVehicleBan.query(request.trx)
    .where('licensePlate', request.body.licensePlate.trim().toUpperCase())
    .where('startDateTime', '<=', Model.fn.now())
    .where('endDateTime', '>', Model.fn.now());
  if (currentVehicleBans.length > 0) {
    const error = errors.cannotStartParkingEvent(enums.ParkingStartError.VehicleBanned);
    response.code(error.statusCode);
    return error;
  }

  try {
    // Check if there is a vehicle present at the entry gate
    const vehicleAtGate = await checkEntryGateInductionLoop();
    if (!vehicleAtGate) {
      const error = errors.cannotStartParkingEvent(enums.ParkingStartError.NoVehicleAtGate);
      response.code(error.statusCode);
      return error;
    }

    // Open the entry gate
    await openEntryGates();
  } catch {
    const error = errors.cannotStartParkingEvent(enums.ParkingStartError.NoReplyFromGate);
    response.code(error.statusCode);
    return error;
  }

  const parkingEventID = randomUUID();

  await DBParkingEvent.query(request.trx).insert({
    ID: parkingEventID,
    userID: request.params.userID,
    licensePlate: request.body.licensePlate.trim().toUpperCase(), // Always store license plates in uppercase format
    expiryDateTime: Model.raw('NOW() + INTERVAL ? SECOND', env.application.maximumParkingTime),
  });

  const newParkingEvent = await DBParkingEvent.query(request.trx).findById(parkingEventID);

  response.code(201);
  return newParkingEvent;
};

/**
 * This handler returns the number of free parking spaces.
 */
export const getFreeParkingSpaces = async (
  request: FastifyRequest,
  response: FastifyReply,
): Promise<types.FreeParkingSpaces | types.Error> => {
  const freeParkingSpaces = await getFreeParkingSpacesCount(request.trx);

  response.code(200);

  return {
    freeParkingSpaces, // Return the number of free parking spaces
  };
};
