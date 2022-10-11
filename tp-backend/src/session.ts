import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { Type, Static } from '@sinclair/typebox';
import Branca from 'branca';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { IncomingHttpHeaders } from 'http2';
import { cookies, errors, headers } from '@truck-parking/tp-api';
import { SessionHandlingError } from './errors';

const sessionToken = Type.Object({
  userID: Type.String({
    format: 'uuid',
  }),
});

type SessionToken = Static<typeof sessionToken>;

export interface SessionConfig {
  readonly ttl: number,
  readonly branca: ReturnType<typeof Branca>,
}

// Bug in Ajv: https://github.com/sinclairzx81/typebox/issues/51
const validate = addFormats(new Ajv()).compile(JSON.parse(JSON.stringify(sessionToken)));

/**
 * Generates a new session token for a user
 * @param config session handler configuration
 * @param userID the ID of the user
 * @param timestamp optional session timestamp
 */
export const newToken = (config: SessionConfig, userID: string, timestamp?: number): string => {
  // Construct and validate a new session token
  const token: SessionToken = { userID };
  if (!validate(token)) {
    throw new SessionHandlingError('token validation failed');
  }

  // Encode it and return
  return config.branca.encode(JSON.stringify(token), timestamp);
};

/**
 * Starts a new session for a user
 * @param config session handler configuration
 * @param response response to update session cookies for
 * @param userID the ID of the user
 */
export const newSession = (config: SessionConfig, response: FastifyReply, userID: string): void => {
  // Set the session token cookie in the response
  response.setCookie(cookies.sessionToken, newToken(config, userID), {
    secure: true,
    sameSite: 'strict',
    path: '/',
  });
};

/**
 * Ends the session for a user
 * @param response response to update session cookies for
 */
export const endSession = (response: FastifyReply): void => {
  // Empty the session token cookie in the response
  response.setCookie(cookies.sessionToken, '', {
    maxAge: 1, // Immediately invalidate cookie
    secure: true,
    sameSite: 'strict',
    path: '/',
  });
};

/**
 * Parses the session token cookie from the given headers
 * @param fastify the Fastify instance
 * @param requestHeaders the incoming headers
 */
const parseCookie = (fastify: FastifyInstance, requestHeaders: IncomingHttpHeaders): string => {
  if (!requestHeaders.cookie) {
    throw new SessionHandlingError('no cookies set');
  }

  // Cookie and header equivalent need to match (double submit)
  const parsed = fastify.parseCookie(requestHeaders.cookie);
  const cookie = parsed[cookies.sessionToken];
  if (cookie !== requestHeaders[headers.sessionToken.toLowerCase()]) {
    throw new SessionHandlingError('token double submit mismatch');
  }

  return cookie;
};

/**
 * Parses a session token from the given cookie
 * @param config session handler configuration
 * @param cookie a cookie containing a session token
 */
export const parseToken = (config: SessionConfig, cookie: string): SessionToken => {
  const token = JSON.parse(config.branca.decode(cookie, config.ttl).toString());
  if (!validate(token)) {
    throw new SessionHandlingError('token validation failed');
  }

  return token as SessionToken;
};

/**
 * Adds a hook for handling session tokens to the given Fastify instance
 * @param config session handler configuration
 * @param fastify the Fastify instance
 */
export const addSessionHook = (config: SessionConfig, fastify: FastifyInstance): void => {
  fastify.decorateRequest('userID', null);
  fastify
    .addHook('onRequest', async (request: FastifyRequest, response) => {
      try {
        // Parse the session cookie from the headers
        const sessionCookie = parseCookie(fastify, request.headers);

        // Decrypt, validate and decode a session out of the cookie
        const session = parseToken(config, sessionCookie);

        // Bake a new cookie into the response if old is about to expire (more than half of TTL expired)
        const timestamp = config.branca.timestamp(sessionCookie);
        if (Date.now() / 1000 > timestamp + config.ttl / 2) {
          newSession(config, response, session.userID);
        }

        // Decorate request with userID
        (request.userID as string) = session.userID;
      } catch (err) {
        // Log any error locally
        fastify.log.error(err); // TODO: Prettier error handling

        // Prematurely terminate the request
        response
          .code(errors.invalidSessionToken.statusCode)
          .send(errors.invalidSessionToken);
      }
    });
};

const sessionConfig = (ttl: number, brancaKey: string): SessionConfig => ({
  ttl,
  branca: Branca(brancaKey),
});

export default sessionConfig;

// This is required to satisfy TypeScript while maintaining the readonly property of userID
declare module 'fastify' {
  interface FastifyRequest {
    readonly userID: string,
  }
}
