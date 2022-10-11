// Unit tests for ObjectionJS plugin
import fastify, { FastifyInstance } from 'fastify';
import { Knex } from 'knex';
import Transaction = Knex.Transaction;

/**
 * A mock class to be used for testing purposes
 *
 * Imitates the most critical parts of Knex.Transaction
 */
class TransactionMock {
  private trxFinished = false;

  /** Manually changes the transaction state to finished */
  manualFinish() {
    this.trxFinished = true;
  }

  commitFn = jest.fn(() => {
    this.trxFinished = true;
    return Promise.resolve();
  });

  rollbackFn = jest.fn(() => {
    this.trxFinished = true;
    return Promise.resolve();
  });

  isCompletedFn = jest.fn(() => this.trxFinished);

  // Mocked transaction object (and thus)
  transaction: Transaction = {
    commit: this.commitFn,
    rollback: this.rollbackFn,
    isCompleted: this.isCompletedFn,
  } as unknown as Transaction;

  mockClear() {
    this.trxFinished = false;
    this.commitFn.mockClear();
    this.rollbackFn.mockClear();
    this.isCompletedFn.mockClear();
  }
}

// Mock objection.Model before importing it
const TRX = new TransactionMock();
const START_TRX_FN = jest.fn((): Promise<Transaction> => Promise.resolve(TRX.transaction));

// Mock objectionJS module before importing objectionPlugin
jest.mock('objection', () => {
  const originalModule = jest.requireActual('objection');

  return { // Return mocked objection module
    __esModule: true,
    ...originalModule,
    Model: {
      ...originalModule.Model,
      // Replace original method with a mocked one:
      startTransaction: START_TRX_FN,
    },
  };
});

// Import objection plugin after mocking objection module
/* eslint-disable-next-line import/first */
import objectionPlugin from '../../src/objection';

describe('objection-plugin', () => {
  const TEST_ENDPOINT_STATUS_CODE = 200;
  const KABOOM_ENDPOINT_STATUS_CODE = 421;
  const CONFLICT_ENDPOINT_STATUS_CODE = 409;
  const ROUTE_FN = jest.fn();

  // Setup fastify
  const server: FastifyInstance = fastify({
    /* Enable logger for easier debugging */
    // logger: {
    //   level: 'trace',
    // },
  });
  server.register(objectionPlugin);

  server.get('/test', (req, rep) => {
    ROUTE_FN(req.trx);
    rep.status(TEST_ENDPOINT_STATUS_CODE);
    rep.send({ hello: 'world!' });
  });

  server.get('/conflict', (req, rep) => {
    ROUTE_FN(req.trx);
    rep.status(CONFLICT_ENDPOINT_STATUS_CODE);
    rep.send({ error: 'conflict!' });
  });

  server.get('/kaboom', (req, rep) => {
    ROUTE_FN(req.trx);
    rep.status(KABOOM_ENDPOINT_STATUS_CODE);
    throw new Error('Kaboom!');
  });

  server.get('/validation', {
    schema: {
      body: {
        type: 'object',
        properties: {
          key: {
            type: 'string',
            description: 'value',
          },
        },
        required: ['key'],
      },
    },
  }, (req, rep) => {
    rep.status(200);
    rep.send({ valid: true });
  });

  server.get('/invalidResponseSchema', {
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            key: {
              type: 'string',
              description: 'value',
            },
          },
          required: ['key'],
        },
      },
    },
  }, (req, rep) => {
    ROUTE_FN(req.trx);
    rep.status(200);
    rep.send({ invalid: 'response' });
  });

  beforeEach(() => {
    // Clear mocked functions before each test
    TRX.mockClear();
    START_TRX_FN.mockClear();
    ROUTE_FN.mockClear();
  });

  test('transaction should be created & committed for successful request', async () => {
    const response = await server.inject().get('/test');

    // Request should succeed
    expect(response.statusCode).toBe(200);

    // The transaction returned from Model.StartTransaction should be passed to route fn via request
    expect(ROUTE_FN).toBeCalledWith(TRX.transaction);

    // Transaction should be started once and committed once
    expect(START_TRX_FN).toBeCalledTimes(1);
    expect(TRX.rollbackFn).not.toHaveBeenCalled();
    expect(TRX.commitFn).toBeCalledTimes(1);
  });

  test('transaction should be created & rolled back for failing request', async () => {
    const response = await server.inject().get('/kaboom');

    // Request should fail with the error code defined by route function
    expect(response.statusCode).toBe(KABOOM_ENDPOINT_STATUS_CODE);

    // The transaction returned from Model.StartTransaction should be passed to route fn via request
    expect(ROUTE_FN).toBeCalledWith(TRX.transaction);

    // Transaction should be started once and rolled back once
    expect(START_TRX_FN).toBeCalledTimes(1);
    expect(TRX.commitFn).not.toHaveBeenCalled();
    expect(TRX.rollbackFn).toBeCalledTimes(1);
  });

  test('transaction should not be started for invalid request', async () => {
    const response = await server.inject().get('/validation');

    // Request should fail
    expect(response.statusCode).toBe(400);

    // Transaction should not be started, rolled back or committed
    expect(START_TRX_FN).not.toHaveBeenCalled();
    expect(TRX.commitFn).not.toHaveBeenCalled();
    expect(TRX.rollbackFn).not.toHaveBeenCalled();
  });

  test('transaction should be rolled back when response serialization fails', async () => {
    const response = await server.inject().get('/invalidResponseSchema');

    // Request should fail
    expect(response.statusCode).toBe(500);

    // The transaction returned from Model.StartTransaction should be passed to route fn via request
    expect(ROUTE_FN).toBeCalledWith(TRX.transaction);

    // Transaction should be started once and rolled back once
    expect(START_TRX_FN).toBeCalledTimes(1);
    expect(TRX.rollbackFn).toBeCalledTimes(1);
    expect(TRX.commitFn).not.toHaveBeenCalled();
  });

  test('request should fail when transaction commit fails', async () => {
    TRX.commitFn.mockImplementationOnce(() => {
      TRX.manualFinish();
      throw new Error('Instant fail!');
    });

    const response = await server.inject().get('/test');

    // Request should fail
    expect(response.statusCode).toBe(500);

    // The transaction returned from Model.StartTransaction should be passed to route fn via request
    expect(ROUTE_FN).toBeCalledWith(TRX.transaction);

    // Transaction should be started once and committed once
    expect(START_TRX_FN).toBeCalledTimes(1);
    expect(TRX.rollbackFn).not.toHaveBeenCalled();
    expect(TRX.commitFn).toBeCalledTimes(1);
  });

  test('request should fail when transaction rollback fails', async () => {
    TRX.rollbackFn.mockImplementationOnce(() => {
      TRX.manualFinish();
      throw new Error('Epic FAIL!');
    });

    const response = await server.inject().get('/conflict');

    // Request should fail with server side error even if the route handler returns a 4xx status code
    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toMatchInlineSnapshot(`
Object {
  "error": "Internal Server Error",
  "message": "Failed to rollback transaction",
  "statusCode": 500,
}
`);

    // The transaction returned from Model.StartTransaction should be passed to route fn via request
    expect(ROUTE_FN).toBeCalledWith(TRX.transaction);

    // Transaction should be started once and rolled back once
    expect(START_TRX_FN).toBeCalledTimes(1);
    expect(TRX.commitFn).not.toHaveBeenCalled();
    expect(TRX.rollbackFn).toBeCalledTimes(1);
  });

  test('request should fail when transaction rollback fails when route function throws', async () => {
    TRX.rollbackFn.mockImplementationOnce(() => {
      TRX.manualFinish();
      throw new Error('Epic FAIL!');
    });

    const response = await server.inject().get('/kaboom');

    // Request should fail with server side error even if the route handler returns a 4xx status code
    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toMatchInlineSnapshot(`
Object {
  "error": "Internal Server Error",
  "message": "Failed to rollback transaction",
  "statusCode": 500,
}
`);

    // The transaction returned from Model.StartTransaction should be passed to route fn via request
    expect(ROUTE_FN).toBeCalledWith(TRX.transaction);

    // Transaction should be started once and committed once
    expect(START_TRX_FN).toBeCalledTimes(1);
    expect(TRX.commitFn).not.toHaveBeenCalled();
    expect(TRX.rollbackFn).toBeCalledTimes(1);
  });

  test('request should fail when transaction begin fails', async () => {
    START_TRX_FN.mockImplementationOnce(() => Promise.reject(new Error('Invalid syntax near...')));

    const response = await server.inject().get('/kaboom');

    // Request should fail with server side error even if the route handler returns a 4xx status code
    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body)).toMatchInlineSnapshot(`
Object {
  "error": "Internal Server Error",
  "message": "Failed to begin transaction",
  "statusCode": 500,
}
`);

    // Transaction should be started once and committed once
    expect(START_TRX_FN).toBeCalledTimes(1);
    expect(TRX.commitFn).not.toBeCalled();
    expect(TRX.rollbackFn).not.toBeCalled();
  });
});
