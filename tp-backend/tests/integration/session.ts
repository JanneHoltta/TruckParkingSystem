import { METHODS } from 'http';
import { SuperAgentTest } from 'supertest';
import { CookieAccessInfo } from 'cookiejar';
import { Response } from 'superagent';
import { cookies, headers, types } from '@truck-parking/tp-api';
import crypto from 'crypto';
import { newAgent } from './agent';

const LOWERCASE_METHODS = METHODS.map((m) => m.toLowerCase());

const ALLOWED_REDIRECTS = 10;

// Create a new session agent
export const agent = newAgent();

/**
 * Helper function for creating a new user. Returns the created user's full personal info.
 */
export const createUser = async (): Promise<types.FullPersonalInfo> => {
  // Define user data with partly random info
  const userData: types.FullPersonalInfo = {
    firstName: 'Esa-Matti',
    lastName: 'Integration',
    phoneNumber: '+3581234567489',
    emailAddress: `${crypto.randomBytes(12).toString('hex')}@integration.com`,
    company: 'Integration Test Company',
    password: crypto.randomBytes(12).toString('hex'),
  };

  // Create user
  const response = await agent.post('/signup').send(userData);
  expect(response.status).toEqual(204);

  // Return user data
  return userData;
};

/**
 * A helper for testing endpoints as an authenticated user
 *
 * First, creates a new user and logs them in via the login endpoint.
 * After successful login, runs the given withSession callback.
 * Finally, destroys the session by calling logout.
 *
 * @param withSession callback for tests to run
 */
export const testWithSession = async (
  withSession: (agent: SuperAgentTest, user: types.FullPersonalInfo) => Promise<void>,
): Promise<void> => {
  let serviceAvailable = false;
  let retries = 10;
  let loginRes: Response;

  // Create a new user for the session
  const user = await createUser();

  while (!serviceAvailable && retries > 0) {
    // Login using the user's credentials
    // eslint-disable-next-line no-await-in-loop
    loginRes = await agent
      .post('/login')
      .send({
        username: user.emailAddress,
        password: user.password,
      })
      .redirects(ALLOWED_REDIRECTS);

    serviceAvailable = loginRes.status !== 503;
    retries -= 1;

    if (!serviceAvailable) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  if (!serviceAvailable) {
    throw new Error('Service not available (Got 503 from backend)');
  }

  expect(loginRes.status).toEqual(204);

  // Save cookies
  agent.jar.setCookies(loginRes.headers['set-cookie']);

  // Save cookie & make SuperTest send the cookie and the required headers for each upcoming request
  const proxy = new Proxy(agent, {
    get(target, prop) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (LOWERCASE_METHODS.includes(prop)) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return (...args) => target[prop](...args).set(
          headers.sessionToken,
          agent.jar.getCookie(cookies.sessionToken, CookieAccessInfo.All).value,
        ).set(
          'Cookie',
          `${cookies.sessionToken}=${agent.jar.getCookie(cookies.sessionToken, CookieAccessInfo.All).value}`,
        );
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return target[prop];
    },
  });

  // Run with session
  await withSession(proxy, user);

  // Log out
  const logoutRes = await agent
    .post('/logout')
    .redirects(ALLOWED_REDIRECTS)
    .expect(204);

  // Save cookies
  agent.jar.setCookies(logoutRes.headers['set-cookie']);
};
