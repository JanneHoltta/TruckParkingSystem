import { Type } from '@sinclair/typebox';

/**
 * An empty response body type for health check.
 */
// eslint-disable-next-line import/prefer-default-export
export const healthCheck = Type.Null({
  description: 'health check ok',
});
