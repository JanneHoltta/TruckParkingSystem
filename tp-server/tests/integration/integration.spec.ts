import request from 'supertest';
import crypto from 'crypto';
import { userStatus } from '@truck-parking/tp-api/dist/headers';
import env, { parseStringEnv } from '../../src/env';
import 'jest-extended';

// Set the before/after hook timeout to be 10 seconds, as the default 5 seconds is too short
jest.setTimeout(10 * 1000);

const { apikey } = env.server;
const container = request(parseStringEnv('SERVER_URL'));

let userID: string = null;
let userIDParking: string = null;
let userIDParkingParkingEventID: string = null;
let userIDParkingStartDateTime: string = null;
let userIDParkingExpiryDateTime: string = null;
let userIDNeverParking: string = null;

let userID404: string = null;

// Random string to make local running of integration tests possible
const randomPart = crypto.randomBytes(12).toString('hex');
const firstName = 'Esa-Matti';
const lastName = 'Integration';
const phoneNumber = '+358441234567';
const company = 'Integration Test Company';
const username = `${randomPart}@test.fi`;
const password = 'kalakukko';
const licensePlate = 'INTEG-0';

/**
 * Helper method to check dates. Checks if a date is within a certain time buffer
 *
 * @param date    The date to be checked
 * @param offset  The offset in seconds in relation to the current time. The default offset is 0,
 *                and the function checks if the time is now.
 */
const expectTime = (date: Date, offset = 0) => {
  const window = 5 * 60 * 1000; // ± 5min
  const referenceTime = Date.now() + offset * 1000;
  expect(date).toBeBetween(new Date(referenceTime - window), new Date(referenceTime + window));
};

/**
 * Helper method to create a valid uuid, but one that doesn't belong to the application's users.
 */
const create404uuid = async () => {
  userID404 = crypto.randomUUID();

  // Check if the uuid is in use
  const response = await container
    .get(`/user/${userID404}`)
    .set('apikey', apikey);

  // If the user already exists, call the creation function again
  if (response.status !== 404) {
    await create404uuid();
  }
};

const expectNoStatus = (headers: Record<string, string>) => {
  expect(headers[userStatus.toLowerCase()]).toBeUndefined();
};

/**
 * Helper for checking the X-User-Status header contents
 *
 * @param headers The response headers
 * @param status  The expected status
 * @param offset  The date offset in seconds; if not given, assume nextParkingAllowed to equal UNIX timestamp 0
 */
const expectStatus = (headers: Record<string, string>, status: string, offset = -Date.now() / 1000) => {
  const obj = JSON.parse(headers[userStatus.toLowerCase()]);
  expect(obj.status).toEqual(status);
  expectTime(new Date(obj.nextParkingAllowed), offset);
};

// Insert new users to the database
// Status code 201 is expected, so all tests fail if the operation fails
beforeAll(async () => {
  // Another user with a parking event
  const firstNameParking = 'Helena-Pirjo';
  const usernameParking = `${randomPart}@test2.fi`;
  const passwordParking = 'kukkokala';

  // Another user who will never get a parking event
  const firstNameNeverParking = 'Jussi-Matti';
  const usernameNeverParking = `${randomPart}@test3.fi`;
  const passwordNeverParking = 'kukkovaikala';

  // Create default user (userID)
  {
    const response = await container
      .post('/user')
      .set('apikey', apikey)
      .send({
        firstName,
        lastName,
        phoneNumber,
        emailAddress: username,
        company,
        password,
      });
    expect(response.status).toEqual(201);
    expectStatus(response.headers, 'idle');
    userID = response.body.ID;
  }

  // Create userIDParking
  {
    const response = await container
      .post('/user')
      .set('apikey', apikey)
      .send({
        firstName: firstNameParking,
        lastName,
        phoneNumber,
        emailAddress: usernameParking,
        company,
        password: passwordParking,
      });
    expect(response.status).toEqual(201);
    expectStatus(response.headers, 'idle');
    userIDParking = response.body.ID;
  }

  // Create parking event for userIDParking
  {
    const response = await container
      .post(`/user/${userIDParking}/parkingEvents`)
      .set('apikey', apikey)
      .send({ licensePlate });
    expect(response.status).toEqual(201);
    expectStatus(response.headers, 'parking', env.application.maximumParkingTime + env.application.cooldownPeriod);
    userIDParkingParkingEventID = response.body.ID;
    userIDParkingStartDateTime = response.body.startDateTime;
    userIDParkingExpiryDateTime = response.body.expiryDateTime;
  }

  // Create userIDNeverParking
  {
    const response = await container
      .post('/user')
      .set('apikey', apikey)
      .send({
        firstName: firstNameNeverParking,
        lastName,
        phoneNumber,
        emailAddress: usernameNeverParking,
        company,
        password: passwordNeverParking,
      });
    expect(response.status).toEqual(201);
    expectStatus(response.headers, 'idle');
    userIDNeverParking = response.body.ID;
  }

  // Create 404 userID
  await create404uuid();
});

describe('The server', () => {
  it('should respond with 401 to any unauthorized GET requests', async () => {
    const response = await container
      .get('/asdf');
    expect(response.status).toEqual(401);
    expectNoStatus(response.headers);
    expect(response.body).toMatchInlineSnapshot(`
Object {
  "error": "Unauthorized",
  "message": "API key missing or invalid",
  "statusCode": 401,
}
`);
  });

  it('should respond with 404 to any authorized GET requests with unknown endpoint', async () => {
    const response = await container
      .get('/asdf')
      .set('apikey', apikey);
    expect(response.status).toEqual(404);
    expectNoStatus(response.headers);
    expect(response.body).toMatchInlineSnapshot(`
Object {
  "error": "Not Found",
  "message": "Route GET:/asdf not found",
  "statusCode": 404,
}
`);
  });
});

describe('The /authenticate endpoint', () => {
  const endpoint = '/authenticate';
  it('should respond with 200 to POST requests with correct credentials', async () => {
    const response = await container
      .post(endpoint)
      .set('apikey', apikey)
      .send({ username, password });
    expect(response.status).toEqual(200);
    expectNoStatus(response.headers);
    expect(response.body).toEqual(
      expect.objectContaining({
        userID,
      }),
    );
  });

  it('should respond with 400 to POST requests with insufficient parameters', async () => {
    const response = await container
      .post(endpoint)
      .set('apikey', apikey)
      .send({ username: 'masa' });
    expect(response.status).toEqual(400);
    expectNoStatus(response.headers);
    expect(response.body).toMatchInlineSnapshot(`
Object {
  "error": "Bad Request",
  "message": "body should have required property 'password'",
  "statusCode": 400,
}
`);
  });

  it('should respond with 403 to POST requests with incorrect username', async () => {
    const response = await container
      .post(endpoint)
      .set('apikey', apikey)
      .send({ username: 'pena', password });
    expect(response.status).toEqual(403);
    expectNoStatus(response.headers);
    expect(response.body).toMatchInlineSnapshot(`
Object {
  "error": "Forbidden",
  "message": "invalid credentials",
  "statusCode": 403,
}
`);
  });

  it('should respond with 403 to POST requests with incorrect password', async () => {
    const response = await container
      .post(endpoint)
      .set('apikey', apikey)
      .send({ username, password: 'asdfasdf123' });
    expect(response.status).toEqual(403);
    expectNoStatus(response.headers);
    expect(response.body).toMatchInlineSnapshot(`
Object {
  "error": "Forbidden",
  "message": "invalid credentials",
  "statusCode": 403,
}
`);
  });
});

describe('The /user/:userID endpoint', () => {
  it('should respond with 200 to GET requests with a valid userID', async () => {
    const response = await container
      .get(`/user/${userID}`)
      .set('apikey', apikey);
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        ID: userID,
        company,
        emailAddress: username,
        firstName,
        lastName,
        phoneNumber,
      }),
    );
    expectTime(new Date(response.body.registerDateTime));
    expect(response.body.registerDateTime).toBeBeforeOrEqualTo(response.body.lastLoginDateTime);
    expectStatus(response.headers, 'idle');
  });

  it('should respond with 400 to GET requests for an invalid userID', async () => {
    const response = await container
      .get('/user/asdf123')
      .set('apikey', apikey);
    expect(response.status).toEqual(400);
    expectNoStatus(response.headers);
    expect(response.body).toMatchInlineSnapshot(`
Object {
  "error": "Bad Request",
  "message": "params.userID should match format \\"uuid\\"",
  "statusCode": 400,
}
`);
  });

  it('should respond with 404 to GET requests for a valid but non-existing userID', async () => {
    const response = await container
      .get(`/user/${userID404}`)
      .set('apikey', apikey);
    expect(response.status).toEqual(404);
    expectNoStatus(response.headers);
    expect(response.body).toMatchInlineSnapshot(`
Object {
  "error": "Not Found",
  "message": "user not found",
  "statusCode": 404,
}
`);
  });
});

describe('The /user endpoint', () => {
  const endpoint = '/user';
  // New user to be inserted into the database
  const randomPart2 = crypto.randomBytes(12).toString('hex');
  const firstName2 = 'Nils-Anders';
  const lastName2 = 'Integration';
  const phoneNumber2 = '+46441234567';
  const username2 = `${randomPart2}@test.sv`;
  const company2 = 'Integration Test Företaget';
  const password2 = 'limpaMedInbakadFisk';

  it('should respond with 201 to POST requests if the user is successfully created', async () => {
    const response = await container
      .post(endpoint)
      .set('apikey', apikey)
      .send({
        firstName: firstName2,
        lastName: lastName2,
        phoneNumber: phoneNumber2,
        emailAddress: username2,
        company: company2,
        password: password2,
      });
    expect(response.status).toEqual(201);
    expectStatus(response.headers, 'idle');
    const userID2 = response.body.ID;
    expect(response.body).toEqual(
      expect.objectContaining({
        ID: userID2,
        company: company2,
        emailAddress: username2,
        firstName: firstName2,
        lastName: lastName2,
        phoneNumber: phoneNumber2,
      }),
    );
    expect(response.body.registerDateTime).toBeBeforeOrEqualTo(response.body.lastLoginDateTime);
  });

  it('should respond with 409 to POST requests if the user already exists', async () => {
    const response = await container
      .post(endpoint)
      .set('apikey', apikey)
      .send({
        firstName,
        lastName,
        phoneNumber,
        emailAddress: username,
        company,
        password,
      });
    expect(response.status).toEqual(409);
    expectNoStatus(response.headers);
    expect(response.body).toMatchInlineSnapshot(`
Object {
  "error": "Conflict",
  "message": "user already exists",
  "statusCode": 409,
}
`);
  });
});

describe('The /user/:userID endpoint', () => {
  let ID: string = null;

  // Old details
  const oldFirstName = 'Hans-Peter';
  const oldLastName = 'Integrätiön';
  const oldPhoneNumber = '+76767676767';
  const oldUsername = `${randomPart}@alt.de`;
  const oldCompany = 'Die alte Firma';
  const oldPassword = 'wasIstDas';

  // New details
  const newFirstName = 'Häns-Pätär';
  const newLastName = 'Integration';
  const newPhoneNumber = '+87878787878';
  const newUsername = `${randomPart}@neu.de`;
  const newCompany = 'Die neue Firma';
  const newPassword = 'esIstWasEsIst';

  // Create user
  beforeAll(async () => {
    const response = await container
      .post('/user')
      .set('apikey', apikey)
      .send({
        firstName: oldFirstName,
        lastName: oldLastName,
        phoneNumber: oldPhoneNumber,
        emailAddress: oldUsername,
        company: oldCompany,
        password: oldPassword,
      });
    expect(response.status).toEqual(201);
    expectStatus(response.headers, 'idle');
    ID = response.body.ID;
  });

  it('should respond with 200 to PATCH requests on success', async () => {
    // Change first name
    {
      const response = await container
        .patch(`/user/${ID}`)
        .set('apikey', apikey)
        .send({
          firstName: newFirstName,
        });
      expect(response.status).toEqual(200);
      expectStatus(response.headers, 'idle');
      expect(response.body).toEqual(
        expect.objectContaining({
          ID,
          firstName: newFirstName,
          lastName: oldLastName,
          phoneNumber: oldPhoneNumber,
          emailAddress: oldUsername,
          company: oldCompany,
        }),
      );
    }
    // Change last name
    {
      const response = await container
        .patch(`/user/${ID}`)
        .set('apikey', apikey)
        .send({
          lastName: newLastName,
        });
      expect(response.status).toEqual(200);
      expectStatus(response.headers, 'idle');
      expect(response.body).toEqual(
        expect.objectContaining({
          ID,
          firstName: newFirstName,
          lastName: newLastName,
          phoneNumber: oldPhoneNumber,
          emailAddress: oldUsername,
          company: oldCompany,
        }),
      );
    }

    // Change phone number
    {
      const response = await container
        .patch(`/user/${ID}`)
        .set('apikey', apikey)
        .send({
          phoneNumber: newPhoneNumber,
        });
      expect(response.status).toEqual(200);
      expectStatus(response.headers, 'idle');
      expect(response.body).toEqual(
        expect.objectContaining({
          ID,
          firstName: newFirstName,
          lastName: newLastName,
          phoneNumber: newPhoneNumber,
          emailAddress: oldUsername,
          company: oldCompany,
        }),
      );
    }

    // Change email address
    {
      const response = await container
        .patch(`/user/${ID}`)
        .set('apikey', apikey)
        .send({
          emailAddress: newUsername,
        });
      expect(response.status).toEqual(200);
      expectStatus(response.headers, 'idle');
      expect(response.body).toEqual(
        expect.objectContaining({
          ID,
          firstName: newFirstName,
          lastName: newLastName,
          phoneNumber: newPhoneNumber,
          emailAddress: newUsername,
          company: oldCompany,
        }),
      );
    }

    // Change company
    {
      const response = await container
        .patch(`/user/${ID}`)
        .set('apikey', apikey)
        .send({
          company: newCompany,
        });
      expect(response.status).toEqual(200);
      expectStatus(response.headers, 'idle');
      expect(response.body).toEqual(
        expect.objectContaining({
          ID,
          firstName: newFirstName,
          lastName: newLastName,
          phoneNumber: newPhoneNumber,
          emailAddress: newUsername,
          company: newCompany,
        }),
      );
    }

    // Change password
    {
      const response = await container
        .patch(`/user/${ID}`)
        .set('apikey', apikey)
        .send({
          password: newPassword,
        });
      expect(response.status).toEqual(200);
      expectStatus(response.headers, 'idle');
      expect(response.body).toEqual(
        expect.objectContaining({
          ID,
          firstName: newFirstName,
          lastName: newLastName,
          phoneNumber: newPhoneNumber,
          emailAddress: newUsername,
          company: newCompany,
        }),
      );

      // The password has changed if logging in with the old password doesn't work anymore
      const authenticateResponse = await container
        .post('/authenticate')
        .set('apikey', apikey)
        .send({
          username: newUsername,
          password: oldPassword,
        });
      expect(authenticateResponse.status).toEqual(403); // Invalid credentials
      expectStatus(response.headers, 'idle');
    }
  });

  it('should respond with 404 to PATCH requests for a valid but non-existing userID', async () => {
    const response = await container
      .patch(`/user/${userID404}`)
      .set('apikey', apikey)
      .send({
        password: oldPassword,
      });
    expect(response.status).toEqual(404);
    expectNoStatus(response.headers);
    expect(response.body).toMatchInlineSnapshot(`
Object {
  "error": "Not Found",
  "message": "user not found",
  "statusCode": 404,
}
`);
  });
});

describe('The /user/:userID/ban endpoint', () => {
  // TODO: Finish once it is possible for the server to ban a user
  /*
  it('should respond with 200 to GET requests if the user is banned', async () => {
    const response = await container
      .get(`/user/${userID}/ban`)
      .set('apikey', apikey);
    expect(response.status).toEqual(200);
    // TODO: Check array of bans
  });
  */
  it('should respond with 200 and an empty array when ban was not found', async () => {
    const response = await container
      .get(`/user/${userID}/ban`)
      .set('apikey', apikey);
    expect(response.status).toEqual(200);
    expectStatus(response.headers, 'idle');
    expect(response.body.currentBans).toEqual([]);
  });

  it('should respond with 404 when user was not found', async () => {
    const response = await container
      .get(`/user/${userID404}/ban`)
      .set('apikey', apikey);
    expect(response.status).toEqual(404);
    expectNoStatus(response.headers);
    expect(response.body).toMatchInlineSnapshot(`
Object {
  "error": "Not Found",
  "message": "user not found",
  "statusCode": 404,
}
`);
  });
});

describe('The /user/:userID/parkingEvents endpoint', () => {
  it('should respond with 200 to GET requests on success for users without parking events', async () => {
    const response = await container
      .get(`/user/${userID}/parkingEvents`)
      .set('apikey', apikey);
    expect(response.status).toEqual(200);
    expectStatus(response.headers, 'idle');
    expect(response.body.parkingEvents).toEqual([]);
  });

  it('should respond with 200 to GET requests on success for users with parking events', async () => {
    // Create new user
    const firstName2 = 'Marju-Pirjo';
    const username2 = `${randomPart}@GETtest.fi`;
    const password2 = 'kanaVaiMuna';
    const response = await container
      .post('/user')
      .set('apikey', apikey)
      .send({
        firstName: firstName2,
        lastName,
        phoneNumber,
        emailAddress: username2,
        company,
        password: password2,
      });
    expect(response.status).toEqual(201);
    expectStatus(response.headers, 'idle');
    const pastParkingUser = response.body.ID;
    // Create parking event for new user
    const response2 = await container
      .post(`/user/${pastParkingUser}/parkingEvents`)
      .set('apikey', apikey)
      .send({ licensePlate });
    expect(response2.status).toEqual(201);
    expectStatus(response2.headers, 'parking', env.application.maximumParkingTime + env.application.cooldownPeriod);
    const pastParkingEvent = response2.body.ID;
    const expDT = response2.body.expiryDateTime;
    const startDT = response2.body.startDateTime;

    // End parking event
    const response3 = await container
      .patch(`/user/${pastParkingUser}/parkingEvents/current/end`)
      .set('apikey', apikey);
    expect(response3.status).toEqual(200);
    expectStatus(response3.headers, 'cooldown', env.application.cooldownPeriod);
    const endDT = response3.body.endDateTime;

    const response4 = await container
      .get(`/user/${pastParkingUser}/parkingEvents`)
      .set('apikey', apikey);
    expect(response4.status).toEqual(200);
    expectStatus(response4.headers, 'cooldown', env.application.cooldownPeriod);
    expect(response4.body.parkingEvents).toEqual(
      expect.arrayContaining([
        {
          ID: pastParkingEvent,
          endDateTime: endDT,
          expiryDateTime: expDT,
          licensePlate,
          startDateTime: startDT,
        },
      ]),
    );
  });

  it('should respond with 201 to POST requests on success', async () => {
    const response = await container
      .post(`/user/${userID}/parkingEvents`)
      .set('apikey', apikey)
      .send({ licensePlate });
    expect(response.status).toEqual(201);
    expectStatus(response.headers, 'parking', env.application.maximumParkingTime + env.application.cooldownPeriod);
    expect(response.body).toEqual(
      expect.objectContaining({
        licensePlate,
      }),
    );
    expectTime(new Date(response.body.startDateTime));
    expect(response.body.endDateTime).toBe(null);
    // The offset is the max parking time
    expectTime(new Date(response.body.expiryDateTime), env.application.maximumParkingTime);
  });

  it('should respond with 404 to GET requests for a valid but non-existing userID', async () => {
    const response = await container
      .get(`/user/${userID404}/parkingEvents`)
      .set('apikey', apikey);
    expect(response.status).toEqual(404);
    expectNoStatus(response.headers);
    expect(response.body).toMatchInlineSnapshot(`
Object {
  "error": "Not Found",
  "message": "user not found",
  "statusCode": 404,
}
`);
  });

  it('should respond with 404 to POST requests for a valid but non-existing userID', async () => {
    const response = await container
      .post(`/user/${userID404}/parkingEvents`)
      .set('apikey', apikey)
      .send({ licensePlate });
    expect(response.status).toEqual(404);
    expectNoStatus(response.headers);
    expect(response.body).toMatchInlineSnapshot(`
Object {
  "error": "Not Found",
  "message": "user not found",
  "statusCode": 404,
}
`);
  });

  it('should respond with 409 to POST requests when a new parking event cannot be started', async () => {
    const lp = 'HEI-123';
    const response = await container
      .post(`/user/${userIDParking}/parkingEvents`)
      .set('apikey', apikey)
      .send({ licensePlate: lp });
    expect(response.status).toEqual(409);
    expectStatus(response.headers, 'parking', env.application.maximumParkingTime + env.application.cooldownPeriod);
    expect(response.body).toMatchInlineSnapshot(`
Object {
  "error": "Conflict",
  "message": "cannot start parking event",
  "reason": "alreadyParking",
  "statusCode": 409,
}
`);
  });
});

describe('The /user/:userID/parkingEvents/:parkingEventID endpoint', () => {
  it('should respond with 200 to GET requests on success', async () => {
    const response = await container
      .get(`/user/${userIDParking}/parkingEvents/${userIDParkingParkingEventID}`)
      .set('apikey', apikey);
    expect(response.status).toEqual(200);
    expectStatus(response.headers, 'parking', env.application.maximumParkingTime + env.application.cooldownPeriod);
    expect(response.body).toEqual(
      expect.objectContaining({
        licensePlate,
        ID: userIDParkingParkingEventID,
      }),
    );
    expect(response.body.startDateTime).toMatch(userIDParkingStartDateTime);
    expect(response.body.endDateTime).toBe(null);
    expect(response.body.expiryDateTime).toMatch(userIDParkingExpiryDateTime);
  });

  it('should respond with 400 to GET requests for an invalid parkingEventID', async () => {
    const response = await container
      .get(`/user/${userID}/parkingEvents/asdf`)
      .set('apikey', apikey);
    expect(response.status).toEqual(400);
    expectNoStatus(response.headers);
    expect(response.body).toMatchInlineSnapshot(`
Object {
  "error": "Bad Request",
  "message": "params.parkingEventID should match format \\"uuid\\"",
  "statusCode": 400,
}
`);
  });

  it('should respond with 404 to GET requests when the parking event was not found', async () => {
    const response = await container
      .get(`/user/${userID}/parkingEvents/${userIDParkingParkingEventID}`)
      .set('apikey', apikey);
    expect(response.status).toEqual(404);
    expectStatus(response.headers, 'parking', env.application.maximumParkingTime + env.application.cooldownPeriod);
    expect(response.body).toMatchInlineSnapshot(`
Object {
  "error": "Not Found",
  "message": "parking event not found",
  "statusCode": 404,
}
`);
  });

  it('should respond with 404 to GET requests for a valid but non-existing userID', async () => {
    const response = await container
      .get(`/user/${userID404}/parkingEvents/${userIDParkingParkingEventID}`)
      .set('apikey', apikey);
    expect(response.status).toEqual(404);
    expectNoStatus(response.headers);
    expect(response.body).toMatchInlineSnapshot(`
Object {
  "error": "Not Found",
  "message": "user not found",
  "statusCode": 404,
}
`);
  });
});

describe('The /user/:userID/parkingEvents/current endpoint', () => {
  it('should respond with 200 to GET requests when current parking event was found', async () => {
    const response = await container
      .get(`/user/${userIDParking}/parkingEvents/current`)
      .set('apikey', apikey);
    expect(response.status).toEqual(200);
    expectStatus(response.headers, 'parking', env.application.maximumParkingTime + env.application.cooldownPeriod);
    expect(response.body).toEqual(
      expect.objectContaining({
        licensePlate,
        ID: userIDParkingParkingEventID,
      }),
    );
    expect(response.body.startDateTime).toMatch(userIDParkingStartDateTime);
    expect(response.body.endDateTime).toBe(null);
    expect(response.body.expiryDateTime).toMatch(userIDParkingExpiryDateTime);
  });

  it('should respond with 204 to GET requests when current parking event was not found', async () => {
    const response = await container
      .get(`/user/${userIDNeverParking}/parkingEvents/current`)
      .set('apikey', apikey);
    expect(response.status).toEqual(204);
    expectStatus(response.headers, 'idle');
    expect(response.body).toMatchObject({});
  });

  it('should respond with 404 to GET requests for a valid but non-existing userID', async () => {
    const response = await container
      .get(`/user/${userID404}/parkingEvents/current`)
      .set('apikey', apikey);
    expect(response.status).toEqual(404);
    expectNoStatus(response.headers);
    expect(response.body).toMatchInlineSnapshot(`
Object {
  "error": "Not Found",
  "message": "user not found",
  "statusCode": 404,
}
`);
  });
});

describe('The /user/:userID/parkingEvents/current/end endpoint', () => {
  it('should respond with 200 to PATCH requests on success', async () => {
    // Create new user
    const firstName2 = 'Kerttu-Peppi';
    const username2 = `${randomPart}@testt.fi`;
    const password2 = 'munaVaiKana';
    const response = await container
      .post('/user')
      .set('apikey', apikey)
      .send({
        firstName: firstName2,
        lastName,
        phoneNumber,
        emailAddress: username2,
        company,
        password: password2,
      });
    expect(response.status).toEqual(201);
    expectStatus(response.headers, 'idle');
    const parkingUser = response.body.ID;
    // Create parking event for new user
    const response2 = await container
      .post(`/user/${parkingUser}/parkingEvents`)
      .set('apikey', apikey)
      .send({ licensePlate });
    expect(response2.status).toEqual(201);
    expectStatus(response2.headers, 'parking', env.application.maximumParkingTime + env.application.cooldownPeriod);
    const parkingEvent = response2.body.ID;

    // End parking event
    const response3 = await container
      .patch(`/user/${parkingUser}/parkingEvents/current/end`)
      .set('apikey', apikey);
    expect(response3.status).toEqual(200);
    expectStatus(response3.headers, 'cooldown', env.application.cooldownPeriod);
    expect(response3.body).toEqual(
      expect.objectContaining({
        licensePlate,
        ID: parkingEvent,
      }),
    );
    expectTime(new Date(response3.body.startDateTime));
    expectTime(new Date(response3.body.endDateTime));
    // The expiry date time is max parking time seconds in the future
    expectTime(new Date(response3.body.expiryDateTime), env.application.maximumParkingTime);
  });

  it('should respond with 404 to PATCH requests for a valid but non-existing userID', async () => {
    const response = await container
      .patch(`/user/${userID404}/parkingEvents/current/end`)
      .set('apikey', apikey);
    expect(response.status).toEqual(404);
    expectNoStatus(response.headers);
    expect(response.body).toMatchInlineSnapshot(`
Object {
  "error": "Not Found",
  "message": "user not found",
  "statusCode": 404,
}
`);
  });

  it('should respond with 409 to GET requests when there is no current parking event', async () => {
    const response = await container
      .patch(`/user/${userIDNeverParking}/parkingEvents/current/end`)
      .set('apikey', apikey);
    expect(response.status).toEqual(409);
    expectStatus(response.headers, 'idle');
    expect(response.body).toMatchInlineSnapshot(`
Object {
  "error": "Conflict",
  "message": "cannot end parking event",
  "reason": "notParking",
  "statusCode": 409,
}
`);
  });
});

describe('The /user/:userID/recentVehicles endpoint', () => {
  it('should respond with 200 to GET requests with a valid userID', async () => {
    const response = await container
      .get(`/user/${userIDParking}/recentVehicles`)
      .set('apikey', apikey);
    expect(response.status).toEqual(200);
    expectStatus(response.headers, 'parking', env.application.maximumParkingTime + env.application.cooldownPeriod);
    expect(response.body).toEqual(
      expect.objectContaining({
        recentVehicles: [
          {
            licensePlate,
            bans: [],
          },
        ],
      }),
    );
  });

  it('should respond with 404 to GET requests for a valid but non-existing userID', async () => {
    const response = await container
      .get(`/user/${userID404}/recentVehicles`)
      .set('apikey', apikey);
    expect(response.status).toEqual(404);
    expectNoStatus(response.headers);
    expect(response.body).toMatchInlineSnapshot(`
Object {
  "error": "Not Found",
  "message": "user not found",
  "statusCode": 404,
}
`);
  });
});

describe('The /freeParkingSpaces endpoint', () => {
  it('should respond with 200 to GET requests', async () => {
    const response = await container
      .get('/freeParkingSpaces')
      .set('apikey', apikey);
    expect(response.status).toEqual(200);
    expectNoStatus(response.headers);
    expect(response.body.freeParkingSpaces).toBeGreaterThanOrEqual(0);
    expect(response.body.freeParkingSpaces).toBeLessThanOrEqual(env.application.parkingSpacesCount);
  });
});

// End ongoing parking events
// Status code 200 is expected, so all tests fail if the operation fails
afterAll(async () => {
  {
    const response = await container
      .patch(`/user/${userIDParking}/parkingEvents/current/end`)
      .set('apikey', apikey);
    expect(response.status).toEqual(200);
    expectStatus(response.headers, 'cooldown', env.application.cooldownPeriod);
  }
  {
    const response = await container
      .patch(`/user/${userID}/parkingEvents/current/end`)
      .set('apikey', apikey);
    expect(response.status).toEqual(200);
    expectStatus(response.headers, 'cooldown', env.application.cooldownPeriod);
  }
});
