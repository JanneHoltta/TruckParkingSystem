import { Type } from '@sinclair/typebox';
import { nonBlank } from '../options/string';

/**
 * Specifies the valid plaintext password format that is used
 * to send the password to the Server during login and signup.
 */
export const password = Type.String({
  description: 'password string',
  example: 'ThisIsAVeryStrongPasswordBanana1234',
  minLength: 8,
  maxLength: 255,
});

/**
 * Specifies the valid format of email addresses sent to
 * the Server during login, signup and password reset
 */
const emailAddress = Type.String({
  description: 'email address',
  example: 'user@example.com',
  // RFC2822 compliant email validation regex
  // eslint-disable-next-line max-len
  pattern: '^([^\\x00-\\x20\\x22\\x28\\x29\\x2c\\x2e\\x3a-\\x3c\\x3e\\x40\\x5b-\\x5d\\x7f-\\xff]+|\\x22([^\\x0d\\x22\\x5c\\x80-\\xff]|\\x5c[\\x00-\\x7f])*\\x22)(\\x2e([^\\x00-\\x20\\x22\\x28\\x29\\x2c\\x2e\\x3a-\\x3c\\x3e\\x40\\x5b-\\x5d\\x7f-\\xff]+|\\x22([^\\x0d\\x22\\x5c\\x80-\\xff]|\\x5c[\\x00-\\x7f])*\\x22))*\\x40([^\\x00-\\x20\\x22\\x28\\x29\\x2c\\x2e\\x3a-\\x3c\\x3e\\x40\\x5b-\\x5d\\x7f-\\xff]+|\\x5b([^\\x0d\\x5b-\\x5d\\x80-\\xff]|\\x5c[\\x00-\\x7f])*\\x5d)(\\x2e([^\\x00-\\x20\\x22\\x28\\x29\\x2c\\x2e\\x3a-\\x3c\\x3e\\x40\\x5b-\\x5d\\x7f-\\xff]+|\\x5b([^\\x0d\\x5b-\\x5d\\x80-\\xff]|\\x5c[\\x00-\\x7f])*\\x5d))*$',
  maxLength: 255,
});

/**
 * Used by the Server to track the complete info of a user, including the password, for signup and
 * updating of some user's info. For the variant without the password field, see {@link personalInfo}.
 */
export const fullPersonalInfo = Type.Object({
  firstName: Type.String({
    ...nonBlank,
    description: 'first name',
    example: 'John',
    minLength: 1,
    maxLength: 255,
  }),
  lastName: Type.String({
    ...nonBlank,
    description: 'last name',
    example: 'Example',
    minLength: 1,
    maxLength: 255,
  }),
  phoneNumber: Type.String({
    description: 'phone number',
    example: '+35801012345678',
    pattern: '^\\+\\d{7,16}$',
  }),
  emailAddress,
  company: Type.String({
    ...nonBlank,
    description: 'company name',
    example: 'Example Inc',
    minLength: 1,
    maxLength: 255,
  }),
  password,
});

/**
 * Used for communicating some user's personal information to the Frontend. It is
 * usually wrapped in a {@link user} instead of being accessed/modified directly.
 */
export const personalInfo = Type.Omit(fullPersonalInfo, ['password']);

/**
 * A variant of {@link fullPersonalInfo} that allows omission of fields. This is used
 * to update select fields of a user's personal info, including their password.
 */
export const personalInfoUpdate = Type.Partial(fullPersonalInfo);

/**
 * Confirmation code used for password reset
 */
export const confirmationCode = Type.String({
  description: 'confirmation code used for password reset',
  example: '123456',
  pattern: '^\\d{6}$',
});

/**
 * Request confirmation code for password reset by email
 */
export const confirmationCodeRequest = Type.Object({
  emailAddress,
});

/**
 * A response body type to indicate that the confirmation code has been successfully sent
 */
export const confirmationCodeSent = Type.Null({
  description: 'confirmation code sent successfully',
});

/**
 * A request body for requesting user password reset
 */
export const resetPassword = Type.Object({
  confirmationCode,
  emailAddress,
  password,
});

/**
 * A response body type to indicate successful password reset
 */
export const resetPasswordDone = Type.Null({
  description: 'password reset successful',
});
