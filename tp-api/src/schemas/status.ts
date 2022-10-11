import { Type } from '@sinclair/typebox';
import { dateTime } from '../options/string';
import { UserStatus } from '../enums';

/**
 * User status object to be returned in a header alongside most responses.
 */
// eslint-disable-next-line import/prefer-default-export
export const userStatus = Type.Object({
  status: Type.Enum(UserStatus, {
    description: 'current status of the user',
    example: UserStatus.Parking,
  }),
  nextParkingAllowed: Type.String({
    ...dateTime,
    description: 'next point in time when starting parking is allowed',
  }),
});

/**
 * A response body type to indicate successful querying of the status endpoint.
 */
export const statusNoOp = Type.Null({
  description: 'status endpoint queried successfully',
});
