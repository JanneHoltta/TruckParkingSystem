// Unit tests for the session hook of the Backend
import Fastify, { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { cookies, headers, types } from '@truck-parking/tp-api';
import fastifyCookie from 'fastify-cookie';
import crypto from 'crypto';
import Session, {
  addSessionHook, endSession, newSession, newToken, parseToken, SessionConfig,
} from '../../src/session';
import { errorResponses } from '../../src/routes';

const testPlugin = async (fastify: FastifyInstance,
  opts: { uuid: string, config: SessionConfig }): Promise<void> => {
  fastify.get(
    '/login',
    {
      schema: {
        response: {
          ...errorResponses,
          204: {},
        },
      },
    }, async (request: FastifyRequest, response: FastifyReply) => {
      newSession(opts.config, response, opts.uuid);
      response.code(204);
    },
  );
};

const sessionTestPlugin = async (fastify: FastifyInstance, config: SessionConfig): Promise<void> => {
  addSessionHook(config, fastify);
  fastify.get('/test', {
    schema: {
      response: {
        ...errorResponses,
        200: {
          user: {
            type: 'string',
            description: 'userID',
          },
        },
      },
    },
  }, async (request: FastifyRequest, response: FastifyReply) => {
    response.code(200);
    return {
      user: request.userID,
    };
  });
  fastify.post('/logout', {
    schema: {
      response: {
        204: {},
      },
    },
  },
  async (request: FastifyRequest, response: FastifyReply) => {
    endSession(response);
    response.code(204);
  });
};

const sessionTokenError: types.Error = {
  statusCode: 401,
  error: 'Unauthorized',
  message: 'invalid session token',
};

describe('session hook', () => {
  const server: FastifyInstance = Fastify({
    /* Enable logger for easier debugging */
    // logger: {
    //   level: 'trace',
    // },
  });

  // Credentials and IDs used for testing
  const testTTL = 3600 * 24;
  const testKey = '99d9ea66ea98e12e9fdc58e4e94042299e0f4d9c740ec1abe74742e571139d68';
  const testUser = '3824951b-b4bf-4e94-91c2-0d82ae36bbff';

  const sessionConfig = Session(testTTL, testKey);

  // Register the cookie plugin
  server.register(fastifyCookie);

  // Register the session test plugins
  server.register(testPlugin, { uuid: testUser, config: sessionConfig });
  server.register(sessionTestPlugin, sessionConfig);

  test('disallows invalid userIDs', async () => {
    // Try to create a new session token for an invalid userID
    expect(() => newToken(sessionConfig, 'nonsense'))
      .toThrowErrorMatchingInlineSnapshot('"token validation failed"');
  });

  test('disallows invalid parsed userIDs', async () => {
    // Try to parse a fake token with an invalid userID
    const fakeToken = sessionConfig.branca.encode('{ "userID": "nonsense" }');
    expect(() => parseToken(sessionConfig, fakeToken))
      .toThrowErrorMatchingInlineSnapshot('"token validation failed"');
  });

  test('generates valid tokens', async () => {
    // The tokens have a random nonce, so we can just test for their length
    expect(newToken(sessionConfig, testUser).length === 128);
  });

  test('successfully creates a new session', async () => {
    const response = await server.inject().get('/login');

    // Check for the session token as the only cookie
    expect(response.cookies.length).toBe(1);
    const { name } = response.cookies[0] as { name: string, value: string };
    expect(name).toBe(cookies.sessionToken);
  });

  test('denies access without cookie and header', async () => {
    const response = await server.inject().get('/test');

    // Should have failed with a session token error
    expect(response.statusCode).toBe(sessionTokenError.statusCode);
    expect(JSON.parse(response.body)).toMatchObject(sessionTokenError);
  });

  test('denies access with only cookie', async () => {
    const token = newToken(sessionConfig, testUser);

    const response = await server.inject().cookies({
      [cookies.sessionToken]: token,
    }).get('/test');

    // Should have failed with a session token error
    expect(response.statusCode).toBe(sessionTokenError.statusCode);
    expect(JSON.parse(response.body)).toMatchObject(sessionTokenError);
  });

  test('denies access with only header', async () => {
    const token = newToken(sessionConfig, testUser);

    const response = await server.inject().headers({
      [headers.sessionToken]: token,
    }).get('/test');

    // Should have failed with a session token error
    expect(response.statusCode).toBe(sessionTokenError.statusCode);
    expect(JSON.parse(response.body)).toMatchObject(sessionTokenError);
  });

  test('denies access with differing cookie and header', async () => {
    const token1 = newToken(sessionConfig, testUser);
    const token2 = newToken(sessionConfig, testUser);

    const response = await server.inject().cookies({
      [cookies.sessionToken]: token1,
    }).headers({
      [headers.sessionToken]: token2,
    }).get('/test');

    // Should have failed with a session token error
    expect(response.statusCode).toBe(sessionTokenError.statusCode);
    expect(JSON.parse(response.body)).toMatchObject(sessionTokenError);
  });

  test('denies access with invalid cookie and header', async () => {
    // Generate random nonsense token
    const token = crypto.randomBytes(64).toString('hex');

    const response = await server.inject().cookies({
      [cookies.sessionToken]: token,
    }).headers({
      [headers.sessionToken]: token,
    }).get('/test');

    // Should have failed with a session token error
    expect(response.statusCode).toBe(sessionTokenError.statusCode);
    expect(JSON.parse(response.body)).toMatchObject(sessionTokenError);
  });

  test('denies access with outdated session', async () => {
    // Generate a token that is about to expire
    const token = newToken(sessionConfig, testUser, Date.now() / 1000 - 2 * sessionConfig.ttl);

    const response = await server.inject().cookies({
      [cookies.sessionToken]: token,
    }).headers({
      [headers.sessionToken]: token,
    }).get('/test');

    // Should have failed with a session token error
    expect(response.statusCode).toBe(sessionTokenError.statusCode);
    expect(JSON.parse(response.body)).toMatchObject(sessionTokenError);
  });

  test('generates a new token if it\'s about to expire', async () => {
    // Generate a token that is about to expire
    const token = newToken(sessionConfig, testUser, Date.now() / 1000 - sessionConfig.ttl / 2);

    const response = await server.inject().cookies({
      [cookies.sessionToken]: token,
    }).headers({
      [headers.sessionToken]: token,
    }).get('/test');

    // The request should have succeeded
    expect(response.statusCode).toBe(200);

    // Check for the new session token as the only cookie
    expect(response.cookies.length).toBe(1);
    const { name, value } = response.cookies[0] as { name: string, value: string };
    expect(name).toBe(cookies.sessionToken);
    expect(value).not.toBe(token); // Verify that the token is new

    const response2 = await server.inject().cookies({
      [cookies.sessionToken]: value,
    }).headers({
      [headers.sessionToken]: value,
    }).get('/test');

    // Verify that a request with the new session token succeeds
    expect(response2.statusCode).toBe(200);
  });

  test('approves access with cookie and header', async () => {
    const token = newToken(sessionConfig, testUser);

    const response = await server.inject().cookies({
      [cookies.sessionToken]: token,
    }).headers({
      [headers.sessionToken]: token,
    }).get('/test');

    // Should have succeeded with the correct userID
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toMatchObject({
      user: testUser,
    });
  });

  test('successfully ends a session', async () => {
    const token = newToken(sessionConfig, testUser);

    const response = await server.inject().cookies({
      [cookies.sessionToken]: token,
    }).headers({
      [headers.sessionToken]: token,
    }).post('/logout');

    // The request should have succeeded
    expect(response.statusCode).toBe(204);

    // The session cookie as the only cookie should be unset
    expect(response.cookies.length).toBe(1);
    const { name, value } = response.cookies[0] as { name: string, value: string };
    expect(name).toBe(cookies.sessionToken);
    expect(value).toBe('');
  });
});
