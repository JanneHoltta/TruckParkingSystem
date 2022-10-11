import { SuperAgentTest } from 'supertest';
import { headers, types } from '@truck-parking/tp-api';
import {
  agent, createUser, testWithSession,
} from './session';
import 'jest-extended';

// License plate used for testing
const licensePlate = 'ABC-123';

/**
 * Helper function for creating and possibly ending parking events within one test. Returns the parking event.
 * @param session the session
 * @param endImmediately should the parking event be ended immediately after creation
 */
const createParkingEvent = async (session: SuperAgentTest, endImmediately = false): Promise<types.ParkingEvent> => {
  // Start parking event
  const responseStart = await session.post('/parkingEvents').send({ licensePlate });
  expect(responseStart.status).toEqual(201);

  if (endImmediately) {
    // End parking event
    const responseEnd = await session.patch('/parkingEvents/current/end');
    expect(responseEnd.status).toEqual(200);
    return responseEnd.body;
  }

  return responseStart.body;
};

/**
 * Helper method to check dates. Checks if a date is within a certain time buffer
 * @param date The date to be checked
 */
const expectTime = (date: Date) => {
  const referenceTime = Date.now();
  const window = 5 * 60 * 1000; // ± 5min
  expect(date).toBeBetween(new Date(referenceTime - window), new Date(referenceTime + window));
};

describe('The /logout endpoint', () => {
  it('should respond with 204 to POST requests on success', () => testWithSession(async (session) => {
    const response = await session.post('/logout');
    expect(response.status).toEqual(204);
    expect(response.get('Set-Cookie')).toMatchObject([
      '__Secure-Session-Token=; Max-Age=1; Path=/; Secure; SameSite=Strict',
    ]);
  }));
});

describe('The /user endpoint', () => {
  // This endpoint can respond with 404 to GET requests, but that can not be tested

  it('should respond with 200 to GET requests for a new, idle user', () => testWithSession(async (session, user) => {
    const response = await session.get('/user');
    const { password, ...responseUser } = user;

    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject(responseUser);
    expectTime(new Date(response.body.registerDateTime));
    expect(response.body.registerDateTime).toBeBeforeOrEqualTo(response.body.lastLoginDateTime);
    expect(response.headers[headers.userStatus.toLowerCase()]).toMatchInlineSnapshot(
      '"{\\"status\\":\\"idle\\",\\"nextParkingAllowed\\":\\"1970-01-01T00:00:00.000Z\\"}"',
    );
  }));

  // This endpoint can respond with 404 to PATCH requests, but that can not be tested

  it('should respond with 200 to PATCH requests on success', () => testWithSession(async (session) => {
    const newUser = await createUser();
    const response = await session.patch('/user').send(newUser);
    const { password, ...responseUser } = newUser;

    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject(responseUser);
  }));
});

describe('The /status endpoint', () => {
  it('should respond with 204 to GET requests', () => testWithSession(async (session) => {
    const response = await session.get('/status');

    expect(response.status).toEqual(204);
    expect(response.body).toMatchObject({});
    // The user has no parking events, so the status should be idle and
    // the nextParkingAllowed timestamp should be UNIX timestamp 0
    expect(response.headers[headers.userStatus.toLowerCase()]).toMatchInlineSnapshot(
      '"{\\"status\\":\\"idle\\",\\"nextParkingAllowed\\":\\"1970-01-01T00:00:00.000Z\\"}"',
    );
  }));
});

describe('The /ban endpoint', () => {
  // TODO: Test GET /ban for an actually banned user
  // it('should respond with 200 to GET requests when user is banned', () => testWithSession(CREDENTIALS,
  //   async (session) => {
  //     const response = await session.get('/ban');
  //     expect(response.status).toEqual(200);
  //     expect(response.body.ID).toBeDefined();
  //   }));

  it(
    'should respond with 200 to GET requests and an empty array, when ban was not found',
    () => testWithSession(async (session) => {
      const response = await session.get('/ban');

      expect(response.status).toEqual(200);
      expect(response.body.currentBans).toEqual([]);
    }),
  );
});

describe('The /parkingEvents endpoint', () => {
  it(
    'should respond with 200 to GET requests, when the user has no previous parking events',
    () => testWithSession(async (session) => {
      const response = await session.get('/parkingEvents');

      expect(response.status).toEqual(200);
      expect(response.body.parkingEvents).toEqual([]);
    }),
  );

  it(
    'should respond with 200 to GET requests, when the user has previous parking events',
    () => testWithSession(async (session) => {
      const parkingEvent = await createParkingEvent(session, true);

      // Get parking events
      const response = await session.get('/parkingEvents');
      expect(response.status).toEqual(200);
      expect(response.body.parkingEvents.length).toBeGreaterThan(0);
      const receivedEvent = response.body.parkingEvents[0]; // First and only parking event
      expect(receivedEvent).toMatchObject(parkingEvent);
      expectTime(new Date(receivedEvent.startDateTime));
      expectTime(new Date(receivedEvent.endDateTime));
    }),
  );

  it('should respond with 201 to POST requests, if the user is not parking', () => testWithSession(async (session) => {
    const parkingEvent = await createParkingEvent(session);

    expect(parkingEvent.licensePlate).toEqual(licensePlate);
    expect(parkingEvent.ID).toBeDefined();
    expectTime(new Date(parkingEvent.startDateTime));
    expect(parkingEvent.endDateTime).toBe(null);
  }));

  it('should respond with 409 to POST requests, if already parking', () => testWithSession(async (session) => {
    await createParkingEvent(session);
    const response = await session.post('/parkingEvents').send({ licensePlate });

    expect(response.status).toEqual(409);
    expect(response.body).toMatchInlineSnapshot(`
Object {
  "error": "Conflict",
  "message": "cannot start parking event",
  "reason": "alreadyParking",
  "statusCode": 409,
}
`);
  }));
});

describe('The /parkingEvents/current endpoint', () => {
  it(
    'should respond with 204 to GET requests, when the user does not have a parking event',
    () => testWithSession(async (session) => {
      // Create an inactive parking event
      await createParkingEvent(session, true);

      // Get current parking event
      const response = await session.get('/parkingEvents/current');
      expect(response.status).toEqual(204);
    }),
  );

  it(
    'should respond with 200 to GET requests, when the user has a current parking event',
    () => testWithSession(async (session) => {
      const parkingEvent = await createParkingEvent(session);

      // Get current parking event
      const response = await session.get('/parkingEvents/current');
      expect(response.status).toEqual(200);
      expect(response.body).toMatchObject(parkingEvent);
      expectTime(new Date(response.body.startDateTime));
      expect(response.body.endDateTime).toBe(null);
    }),
  );
});

describe('The /parkingEvents/:parkingEventID endpoint', () => {
  it('should respond with 200 to GET requests for an existing parking event', () => testWithSession(async (session) => {
    const parkingEvent = await createParkingEvent(session);

    const response = await session.get(`/parkingEvents/${parkingEvent.ID}`);
    expect(response.status).toEqual(200);
    expect(response.body).toMatchObject(parkingEvent);
    expectTime(new Date(response.body.startDateTime));
    expect(response.body.endDateTime).toBe(null);
  }));

  it(
    'should respond with 404 to GET requests for a non-existent parking event',
    () => testWithSession(async (session) => {
      const response = await session.get('/parkingEvents/00000000-0000-0000-0000-000000000000');
      expect(response.status).toEqual(404);
      expect(response.body).toMatchInlineSnapshot(`
Object {
  "error": "Not Found",
  "message": "parking event not found",
  "statusCode": 404,
}
`);
    }),
  );
});

describe('The /parkingEvents/current/end endpoint', () => {
  it(
    'should respond with 200 to PATCH requests, if there is an active parking event',
    () => testWithSession(async (session) => {
      const parkingEvent = await createParkingEvent(session);
      const { endDateTime, ...endedParkingEvent } = parkingEvent;

      // End parking event
      const response = await session.patch('/parkingEvents/current/end');
      expect(response.status).toEqual(200);
      expect(response.body).toMatchObject(endedParkingEvent);
      expectTime(new Date(response.body.startDateTime));
      expectTime(new Date(response.body.endDateTime));
    }),
  );

  it('should respond with 409 to PATCH requests, if there is no active parking event', () => testWithSession(
    async (session) => {
      const response = await session.patch('/parkingEvents/current/end');
      expect(response.status).toEqual(409);
      expect(response.body).toMatchInlineSnapshot(`
Object {
  "error": "Conflict",
  "message": "cannot end parking event",
  "reason": "notParking",
  "statusCode": 409,
}
`);
    },
  ));
});

describe('The /recentVehicles endpoint', () => {
  it('should respond with 200 and the known license plates to GET requests', () => testWithSession(async (session) => {
    await createParkingEvent(session, true);

    const response = await session.get('/recentVehicles');
    expect(response.status).toEqual(200);
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
  }));
});

describe('The /freeParkingSpaces endpoint', () => {
  it('should respond with 200 to GET requests', async () => {
    const response = await agent.get('/freeParkingSpaces');
    expect(response.status).toEqual(200);
    expect(response.body.freeParkingSpaces).toBeGreaterThanOrEqual(0);
  });
});
