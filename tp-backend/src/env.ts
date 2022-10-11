import process from 'process';
import crypto from 'crypto';

/**
 * Configuration parameters parsed from environment variables
 */
export interface EnvConfig {
  address: string,
  port: number,
  brancaKey: string,
  ttl: number,
  serverURL: string,
  serverAPIKey: string,
}

/**
 * Custom Error class for env variable parsing errors
 */
export class InvalidEnvValueError extends Error {
  /**
   * Custom Error class for env variable parsing errors
   *
   * @param name env variable name (like 'NODE_ENV')
   * @param message error message
   */
  constructor(name: string, message?: string) {
    super(`Invalid value for env variable: ${name}${message !== undefined ? `: ${message}` : ''}`);
  }
}

/**
 * Parses env variable as a string
 *
 * Returns a descriptive InvalidEnvValueError if parsing fails.
 * Default value (optional) will be used when the given env variable is not defined.
 *
 * @param name env variable name (like 'NODE_ENV')
 * @param defaultValue default value (optional)
 * @param allowEmpty allow empty string (optional; default false)
 */
export const parseStringEnv = (name: string, defaultValue?: string, allowEmpty = false): string => {
  const envValue = process.env[name];
  if (envValue === undefined) {
    if (defaultValue !== undefined) {
      // eslint-disable-next-line no-console
      console.info(`Using default value '${defaultValue}' for env variable '${name}'`);
      return defaultValue;
    }

    throw new InvalidEnvValueError(name, 'must be defined');
  } else if (!allowEmpty && envValue === '') {
    throw new InvalidEnvValueError(name, 'empty value is not allowed');
  }

  return envValue;
};

/**
 * Parses env variable as an integer number
 *
 * Returns a descriptive InvalidEnvValueError if parsing fails.
 * Default value (optional) will be used when the given env variable is not defined.
 *
 * @param name env variable name (like 'NODE_ENV')
 * @param defaultValue default value (optional)
 */
export const parseIntegerEnv = (name: string, defaultValue?: number): number => {
  const envValue = process.env[name];

  if (envValue === undefined) {
    if (defaultValue !== undefined) {
      // eslint-disable-next-line no-console
      console.info(`Using default value '${defaultValue}' for env variable '${name}'`);
      return defaultValue;
    }

    throw new InvalidEnvValueError(name, 'must be defined');
  }

  // Parse integer
  const parsed = parseInt(envValue, 10);

  // eslint-disable-next-line no-restricted-globals
  if (isNaN(parsed)) {
    throw new InvalidEnvValueError(name, 'must be an integer');
  }

  return parsed;
};

// Parse all env variables here
const parseEnv = (): EnvConfig => ({
  address: parseStringEnv('LISTEN_ADDRESS', '0.0.0.0'),
  port: parseIntegerEnv('LISTEN_PORT', 3000),
  brancaKey: parseStringEnv('SESSION_ENCRYPTION_KEY', crypto.randomBytes(32).toString('hex')),
  ttl: parseIntegerEnv('SESSION_TTL', 3600 * 24),
  serverURL: parseStringEnv('SERVER_URL'),
  serverAPIKey: parseStringEnv('APIKEY'),
});

const env = parseEnv();

/**
 * Configuration parsed from env variables
 */
export default env;
