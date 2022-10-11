import { Type } from '@sinclair/typebox';
import { ParkingStartError, ParkingEndError } from '../enums';

/**
 * Defines the error format used by the validation build into Fastify.
 * This format should also be used for custom errors.
 */
// eslint-disable-next-line import/prefer-default-export
export const error = Type.Object({
  statusCode: Type.Number({
    description: 'error status code',
    example: 401,
  }),
  error: Type.String({
    description: 'error type',
    example: 'Unauthorized',
  }),
  message: Type.String({
    description: 'error message',
    example: 'invalid credentials',
  }),
});

export const parkingStartError = Type.Intersect([
  error,
  Type.Object({
    reason: Type.Enum(ParkingStartError, {
      description: 'reason why parking start failed',
      example: ParkingStartError.AreaFull,
    }),
  }),
]);

export const parkingEndError = Type.Intersect([
  error,
  Type.Object({
    reason: Type.Enum(ParkingEndError, {
      description: 'reason why parking end failed',
      example: ParkingEndError.NoVehicleAtGate,
    }),
  }),
]);
