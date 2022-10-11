import Fastify, { FastifyInstance } from 'fastify';
import fastifyCookie from 'fastify-cookie';
import axios from 'axios';
import { routesPlugin, sessionRoutesPlugin } from './routes';
import Session from './session';
import env from './env';
import { UpstreamError } from './errors';

const initHTTPServer = async () => {
  // Initialize axios
  axios.defaults.baseURL = env.serverURL;
  axios.defaults.headers.common.apikey = env.serverAPIKey;
  axios.defaults.validateStatus = () => true; // Consider all responses as "valid"
  axios.interceptors.response.use((response) => response, (err) => {
    throw new UpstreamError(err.response);
  });

  // Initialize the session handling and server
  const sessionConfig = Session(env.ttl, env.brancaKey);
  const server: FastifyInstance = Fastify({ logger: true });
  server.register(fastifyCookie);
  server.register(routesPlugin, sessionConfig);
  server.register(sessionRoutesPlugin, sessionConfig);

  try {
    await server.listen(env.port, env.address);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

initHTTPServer().then();
