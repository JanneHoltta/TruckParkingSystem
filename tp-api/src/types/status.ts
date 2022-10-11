import { Static } from '@sinclair/typebox';
import * as schemas from '../schemas/status';

/** Static type of the {@link schemas.userStatus} object */
export type UserStatus = Static<typeof schemas.userStatus>;
/** Static type of the {@link schemas.statusNoOp} object */
export type StatusNoOp = Static<typeof schemas.statusNoOp>;
