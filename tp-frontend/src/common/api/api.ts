import axios, { AxiosResponse } from 'axios';
import VueI18n from 'vue-i18n';
import Cookies from 'js-cookie';
import {
  APIError, APIErrorMessage, SilentAPIError, universalAPIError,
} from '@/common/api/error';
import { ToasterMethods } from '@/common/plugins/toaster';
import {
  acceptOnly, EmbeddedStatus, extractStatus,
} from '@/common/api/utils';
import { redirect } from '@/common/api/matrix';
import VueRouter from 'vue-router';
import { types } from '@truck-parking/tp-api';

// Make axios accept all response status codes (no rejections even with the 5xx ones)
axios.defaults.validateStatus = null;
// Set the global base API URL for accessing the backend
axios.defaults.baseURL = '/api/v1';

export interface APIParams {
  /** The name for the cookie used in authentication */
  authCookieName: string

  /** The name for the header to be used with the double submit strategy.
   *
   * On each request, the authentication cookie will be included within this header.
   */
  authHeaderName: string
}

// eslint-disable-next-line import/prefer-default-export
export class BaseAPI implements APIParams {
  readonly authCookieName: string;
  readonly authHeaderName: string;

  // sessionAxios is used by endpoints that need a valid session,
  // it uses the same baseURL as the top-level Axios instance
  protected readonly sessionAxios = axios.create({ baseURL: axios.defaults.baseURL });
  private readonly i18n: VueI18n;
  protected readonly toaster: ToasterMethods;
  private readonly router: VueRouter;

  /** Get authentication cookie if not found return an empty string */
  protected getCookie(): string {
    const cookie = Cookies.get(this.authCookieName);
    if (cookie === undefined) {
      console.warn('Cannot find authentication cookie');
      return '';
    }

    return cookie;
  }

  constructor(
    onUnauthenticatedResponse: () => void,
    i18n: VueI18n,
    toaster: ToasterMethods,
    router: VueRouter,
    params: APIParams,
  ) {
    this.authCookieName = params.authCookieName;
    this.authHeaderName = params.authHeaderName;
    this.i18n = i18n;
    this.toaster = toaster;
    this.router = router;

    /** Include authentication cookie as a header in every request (double submit strategy) */
    this.sessionAxios.interceptors.request.use((config) => {
      if (config.headers === undefined) {
        // eslint-disable-next-line no-param-reassign
        config.headers = { [this.authHeaderName]: this.getCookie() };
      } else {
        // eslint-disable-next-line no-param-reassign
        config.headers[this.authHeaderName] = this.getCookie();
      }

      return config;
    });

    /**
     * Run onUnauthenticatedResponse if any of the requests fails with status 401 (unauthorized).
     */
    this.sessionAxios.interceptors.response.use(
      (response) => {
        if (response?.status === 401) {
          onUnauthenticatedResponse();
          return Promise.reject(new SilentAPIError('Unauthorized', { response }));
        }
        return response;
      },
      (error) => Promise.reject(error),
    );
  }

  /** Checks whether authentication cookie exists in the browser */
  hasCookie(): boolean {
    return !!this.getCookie();
  }

  /** Uses toaster to inform the user about the given APIError */
  protected toastError(err: APIError): void {
    this.toaster.error(this.i18n.t(err.i18nKey).toString());
  }

  /**
   * Sets up a whitelist rule accepting only the specified responses based on the response status
   * codes. Extracts the user's status and wraps it into an `EmbeddedStatus` type with the body.
   *
   * All non-whitelisted status codes will throw an error using the given i18n errorMessage.
   *
   * There are multiple ways to define the whitelists:
   *
   * ```
   * somePromise
   *   .then(acceptOnlyWithStatus(200, 'i18n-key-for-the-error'))
   *   .then(acceptOnlyWithStatus([200, 201], 'i18n-key-for-the-error'))
   * ```
   *
   * @param status status code or status codes to accept
   * @param errorMessage APIErrorMessage or i18n key for the localized error message (optional)
   */
  protected acceptOnlyWithStatus<T>(
    status: number | number[],
    errorMessage?: APIErrorMessage | string,
  ) {
    return (res: AxiosResponse<T>): EmbeddedStatus<T> => {
      // Run the regular acceptance logic, this will throw on error
      const body = acceptOnly<T>(status, errorMessage)(res);
      // Extract the user's status from the headers and check for redirections
      const userStatus = this.checkStatus(res);

      return {
        body,
        userStatus,
      };
    };
  }

  /**
   * Sets up a whitelist rule accepting only the specified responses based on the response status
   * codes. Extracts the user's status and wraps it into an `EmbeddedStatus` type with the body.
   *
   * All non-whitelisted status codes will throw an error using the given i18n errorMessage.
   *
   * Defining the whitelists:
   *
   * ```
   * somePromise
   *   .then(
   *     acceptOnlyTransformWithStatus(
   *       {
   *         200: (responseData) => {
   *           // modify the response data before resolving the promise
   *           return responseData
   *         },
   *         201: ...
   *       },
   *       'i18n-key-for-the-error',
   *     )
   *   )
   * ```
   *
   * @param statusTransform status code based transform table
   * @param errorMessage APIErrorMessage or i18n key for the localized error message (optional)
   */
  protected acceptOnlyTransformWithStatus<T, U>(
    statusTransform: Record<number, (r: T) => U>,
    errorMessage?: APIErrorMessage | string,
  ) {
    return (res: AxiosResponse<T>): EmbeddedStatus<U> => {
      // eslint-disable-next-line no-restricted-syntax
      for (const [key, val] of Object.entries(statusTransform)) {
        const statusCode = parseInt(key, 10);

        if (statusCode !== undefined && res.status === statusCode) {
          // Extract the user's status from the headers and check for redirections
          const userStatus = this.checkStatus(res);

          return {
            body: val(res.data), // Match; transform the data
            userStatus,
          };
        }
      }

      // No whitelist matches, throw an APIError
      throw universalAPIError(errorMessage, res);
    };
  }

  protected checkStatus(res: AxiosResponse): types.UserStatus {
    const userStatus = extractStatus(res);

    // If the router knows there we are, check the redirection
    // matrix for where we should be based on the user's status
    if (this.router.currentRoute.name) {
      const target = redirect(this.router.currentRoute.name, userStatus.status);
      if (target) {
        // We have a target that is not this page, go there
        this.router.replace({ name: target }).then();
      }
    }

    return userStatus;
  }

  /**
   * Sets up a catcher that catches rejections and informs the user about the error via toasts.
   *
   * Creates a new APIError if the thrown error is not already an APIError.
   * Re-throws the error APIError.
   *
   * Usage: chaining with a promise using .catch():
   * ```
   * somePromise
   *   .then(...) // chain other tasks here
   *   .catch(this.inspectError())
   *
   * ```
   *
   * @protected
   */
  protected inspectError(): ((err: unknown) => never) {
    return (err: unknown) => {
      if (err instanceof SilentAPIError) {
        throw err;
      }
      const e: APIError = (() => {
        if (err instanceof APIError) {
          // Caught an APIError
          return err;
        }

        if (err instanceof Error) {
          // Caught some other error – convert it into an APIError
          return new APIError(
            'Encountered an error while communicating with backend',
            'api-server-fail',
            {
              stack: err.stack,
            },
          );
        }

        // Caught something other than an error
        // (yes, in js it is possible to throw anything, not just the errors :D)
        return universalAPIError();
      })();

      this.toastError(e);

      throw e;
    };
  }
}
