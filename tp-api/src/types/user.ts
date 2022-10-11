import { Static } from '@sinclair/typebox';
import * as schemas from '../schemas/user';

/** Static type of the {@link schemas.userID} object */
export type UserID = Static<typeof schemas.userID>;
/** Static type of the {@link schemas.user} object */
export type User = Static<typeof schemas.user>;
/** Static type of the {@link schemas.dbUser} object */
export type DBUser = Static<typeof schemas.dbUser>;
