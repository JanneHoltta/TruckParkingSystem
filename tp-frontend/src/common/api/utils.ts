import {
  APIError, APIErrorMessage, universalAPIError,
} from '@/common/api/error';
import { AxiosResponse } from 'axios';
import { headers, types } from '@truck-parking/tp-api';

/**
 * Sets up a whitelist rule accepting only the specified responses based on the response status
 * codes.
 *
 * All non-whitelisted status codes will throw an error using the given i18n errorMessage.
 *
 * There are multiple ways to define the whitelists:
 *
 * ```
 * somePromise
 *   .then(acceptOnly(200, 'i18n-key-for-the-error'))
 *   .then(acceptOnly([200, 201], 'i18n-key-for-the-error'))
 * ```
 *
 * @param status status code or status codes to accept
 * @param errorMessage APIErrorMessage or i18n key for the localized error message (optional)
 */
export const acceptOnly = <T>(
  status: number | number[],
  errorMessage?: APIErrorMessage | string,
) => (res: AxiosResponse<T>): T => {
    if (Array.isArray(status)) {
      // status is an array of status codes
      if (status.includes(res.status)) {
        return res.data; // Match
      }
    } else if (res.status === status) { // otherwise: status is a number indicating the status code
      return res.data;
    }

    // No whitelist matches, throw an APIError
    throw universalAPIError(errorMessage, res);
  };

export interface EmbeddedStatus<T> {
  body: T,
  userStatus: types.UserStatus
}

/**
 * Helper for extracting and parsing the user status header contents into types.UserStatus
 */
export const extractStatus = (res: AxiosResponse): types.UserStatus => {
  const header = res.headers[headers.userStatus.toLowerCase()];
  if (!header) {
    throw universalAPIError({
      message: 'Failed to find user status header from response',
      i18nKey: 'api-server-fail',
    }, res);
  }

  try {
    return JSON.parse(header);
  } catch (err) {
    throw universalAPIError({
      message: 'Failed to parse user status header from response',
      i18nKey: 'api-server-fail',
    }, res);
  }
};

/**
 * Sets up a blacklist rule rejecting responses with a specified status code.
 *
 * On reject, throws an APIError using the given i18n errorMessage.
 *
 * Usage:
 * ```
 * somePromise
 *   .then(reject(404, 'i18n-key-for-non-existing-object'))
 * ```
 *
 * @param status status code to reject
 * @param errorMessage APIErrorMessage describing why the response is being rejected
 */
export const reject = (
  status: number,
  errorMessage: APIErrorMessage | ((res: AxiosResponse) => APIErrorMessage),
) => (res: AxiosResponse): AxiosResponse | never => {
  if (res.status !== status) {
    return res;
  }

  // Status code matched; throw an APIError
  const m = (typeof errorMessage === 'function') ? errorMessage(res) : errorMessage;

  throw new APIError(
    m.message,
    m.i18nKey,
    {
      response: res,
    },
  );
};
