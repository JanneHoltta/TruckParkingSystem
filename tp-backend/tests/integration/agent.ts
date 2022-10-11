import { agent, SuperAgentTest } from 'supertest';
import { parseStringEnv } from '../../src/env';

/** Creates a new SuperTest agent to make test requests to the running app. */
// eslint-disable-next-line import/prefer-default-export
export const newAgent = (): SuperAgentTest => agent(parseStringEnv('BACKEND_URL'));
