// eslint-disable-next-line max-classes-per-file
import { AxiosResponse } from 'axios';

// Error type enabling easy logging and tracing of upstream (server) errors
export class UpstreamError extends Error {
  // NOTE: Fastify includes this in the log output if uncommented
  // readonly response: AxiosResponse;

  constructor(response: AxiosResponse) {
    super(`upstream returned error ${response.status}: ${JSON.stringify(response.data)}`);
    // this.response = response;
  }
}

// Error type for logging and tracing errors from session handling (incl. token validation)
export class SessionHandlingError extends Error {}
