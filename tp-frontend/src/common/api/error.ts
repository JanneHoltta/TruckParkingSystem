/* eslint-disable max-classes-per-file */
import { AxiosResponse } from 'axios';

/** Additional params for APIError */
export interface APIErrorParams {
  /** axios response of the failed request (optional, for debugging purposes) */
  response?: AxiosResponse

  /** call stack of the original error (optional, for debugging purposes) */
  stack?: string
}

/**
 * A data structure class for API errors
 */
export class APIError extends Error {
  protected readonly params: APIErrorParams;

  /** title for the error (preferably short; used for debugging) */
  public readonly message: string;

  /** i18n key for the localized error message (used for the toasts) */
  public readonly i18nKey: string;

  /**
   * Custom error class for API errors
   *
   * Methods genericAPIError and serverSideAPIError provide more generic and easier-to-use
   * constructors. You should consider using them in the first place.
   *
   * @param message error message for debugging purposes
   * @param i18nKey i18n key for the localized message to be used in toasts
   * @param params additional params (optional)
   */
  constructor(message: string, i18nKey: string, params: APIErrorParams = {}) {
    super(message);

    this.params = params;
    this.message = message;
    this.i18nKey = i18nKey;

    if (this.params.stack === undefined) {
      this.params.stack = super.stack;
    }
  }

  /** Returns the error stack */
  get stack(): string | undefined {
    return this.params.stack;
  }
}

/** Class for APIErrors without toasting */
export class SilentAPIError extends Error {
  protected readonly params: APIErrorParams;

  /** title for the error (preferably short; used for debugging) */
  public readonly message: string;

  /** Class for APIErrors without toasting */
  constructor(message: string, params: APIErrorParams = {}) {
    super(message);

    this.params = params;
    this.message = message;

    if (this.params.stack === undefined) {
      this.params.stack = super.stack;
    }
  }
}

/** An object containing both the error message and related i18n key for the localized message. */
export interface APIErrorMessage {
  /** title for the error (preferably short) */
  message: string

  /** i18n key for the localized error message */
  i18nKey: string
}

/**
 * Helper for creating a universal API error
 *
 * @param message full error message (APIErrorMessage) or i18n key (string) for the error (optional)
 * @param response related response (optional)
 * @param stack call stack for the original error (optional)
 */
export const universalAPIError = (
  message?: APIErrorMessage | string,
  response?: AxiosResponse,
  stack?: string,
): APIError => {
  const m: APIErrorMessage = (typeof message === 'string' || message === undefined) ? {
    message: 'Encountered an error while communicating with backend',
    i18nKey: message || 'api-server-fail',
  } : message;

  return new APIError(
    m.message,
    m.i18nKey,
    {
      response,
      stack,
    },
  );
};
