import { Static } from '@sinclair/typebox';
import * as schemas from '../schemas/personalInfo';

/** Static type of the {@link schemas.password} object */
export type Password = Static<typeof schemas.password>;
/** Static type of the {@link schemas.fullPersonalInfo} object */
export type FullPersonalInfo = Static<typeof schemas.fullPersonalInfo>;
/** Static type of the {@link schemas.personalInfo} object */
export type PersonalInfo = Static<typeof schemas.personalInfo>;
/** Static type of the {@link schemas.personalInfoUpdate} object */
export type PersonalInfoUpdate = Static<typeof schemas.personalInfoUpdate>;
/** Static type of the {@link schemas.confirmationCodeRequest} object */
export type ConfirmationCodeRequest = Static<typeof schemas.confirmationCodeRequest>;
/** Static type of the {@link schemas.confirmationCodeSent} object */
export type ConfirmationCodeSent = Static<typeof schemas.confirmationCodeSent>;
/** Static type of the {@link schemas.resetPassword} object */
export type ResetPassword = Static<typeof schemas.resetPassword>;
/** Static type of the {@link schemas.resetPasswordDone} object */
export type ResetPasswordDone = Static<typeof schemas.resetPasswordDone>;
