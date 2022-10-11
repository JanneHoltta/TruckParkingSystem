import { Static } from '@sinclair/typebox';
import * as schemas from '../schemas/session';

/** Static type of the {@link schemas.signup} object */
export type Signup = Static<typeof schemas.signup>;
/** Static type of the {@link schemas.login} object */
export type Login = Static<typeof schemas.login>;
/** Static type of the {@link schemas.authenticated} object */
export type Authenticated = Static<typeof schemas.authenticated>;
/** Static type of the {@link schemas.sessionOperationSuccess} object */
export type SessionOperationSuccess = Static<typeof schemas.sessionOperationSuccess>;
