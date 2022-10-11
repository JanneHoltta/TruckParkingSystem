import process from 'process';

/**
 * Config variables for database
 */
export interface DatabaseConfig {
  host: string
  port: number
  user: string
  password: string
  database: string
}

/**
 * Config variables for server (fastify)
 */
export interface ServerConfig {
  host: string
  port: number
  apikey: string
  smsServerUri: string;
  smsToken: string;
}

/**
 * Config variables for the application
 */
export interface ApplicationConfig {
  /**
   * Fetch at most this amount of recent vehicles when querying the `/recentVehicles` endpoint
   */
  recentVehiclesLimit: number,
  /**
   * The amount of seconds a user must wait after driving out to be allowed in again
   */
  cooldownPeriod: number,
  /**
   * The number of parking spaces in the parking area
   */
  parkingSpacesCount: number,
  /**
   * The amount of seconds a user is allowed to park on a singe occasion
   */
  maximumParkingTime: number,
  /**
   * The amount of seconds the password reset confirmation code is valid
   */
  confirmationCodeLifetime: number,
  /**
   * The IP addresses of entry gates, comma separated
   * The supported device is Shelly Pro 2 with the following connections:
   * - Open gate -> switch0
   * - Close gate -> switch1
   * - Induction loop output -> input0 (only evaluated for the first gate IP address)
   * - Boom missing sensor output -> input1
   */
  entryGatesIPs: string,
  /**
   * The IP addresses of exit gates, comma separated
   * The supported device is Shelly Pro 2 with the following connections:
   * - Open gate -> switch0
   * - Close gate -> switch1
   * - Induction loop output -> input0 (only evaluated for the first gate IP address)
   * - Boom missing sensor output -> input1
   */
  exitGatesIPs: string,
}

/**
 * Configuration parameters parsed from environment variables
 */
export interface EnvConfig {
  db: DatabaseConfig,
  server: ServerConfig,
  application: ApplicationConfig,
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

const parseEnv = (): EnvConfig => ({
  // Parse all env variables here
  db: {
    host: parseStringEnv('DB_HOST'),
    port: parseIntegerEnv('DB_PORT', 3306),
    user: parseStringEnv('DB_USER'),
    password: parseStringEnv('DB_PASSWORD'),
    database: parseStringEnv('DB_DATABASE'),
  },
  server: {
    host: parseStringEnv('LISTEN_ADDRESS', '0.0.0.0'),
    port: parseIntegerEnv('LISTEN_PORT', 3000),
    apikey: parseStringEnv('APIKEY'),
    smsServerUri: parseStringEnv('SMS_SERVER_URI'),
    smsToken: parseStringEnv('SMS_TOKEN'),
  },
  application: {
    recentVehiclesLimit: parseIntegerEnv('RECENT_VEHICLES_LIMIT', 3),
    cooldownPeriod: parseIntegerEnv('PARKING_COOLDOWN_SECONDS', 3600),
    parkingSpacesCount: parseIntegerEnv('PARKING_SPACES_COUNT', 60),
    maximumParkingTime: parseIntegerEnv('MAX_PARKING_TIME_SECONDS', 18 * 3600),
    confirmationCodeLifetime: parseIntegerEnv('CONFIRMATION_CODE_LIFETIME_SECONDS', 15 * 60),
    entryGatesIPs: parseStringEnv('ENTRY_GATE_IPS'),
    exitGatesIPs: parseStringEnv('EXIT_GATE_IPS'),
  },
});

const env = parseEnv();

/**
 * Configuration parsed from env variables
 */
export default env;
