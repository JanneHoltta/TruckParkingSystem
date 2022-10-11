import { Static } from '@sinclair/typebox';
import * as schemas from '../schemas/error';

/** Static type of the {@link schemas.error} object */
export type Error = Static<typeof schemas.error>;
/** Static type of the {@link schemas.parkingStartError} object */
export type ParkingStartError = Static<typeof schemas.parkingStartError>;
/** Static type of the {@link schemas.parkingEndError} object */
export type ParkingEndError = Static<typeof schemas.parkingEndError>;
