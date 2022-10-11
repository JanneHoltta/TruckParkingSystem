import { StringFormatOption, StringOptions } from '@sinclair/typebox';

/**
 * Predefined string format options used by all 'date-time' formatted strings.
 */
export const dateTime: StringOptions<StringFormatOption> = {
  example: '2021-10-19T12:12:41.376Z',
  format: 'date-time',
};

/**
 * Predefined string format options used by all 'uuid' formatted strings.
 */
export const uuid: StringOptions<StringFormatOption> = {
  example: '4014ba21-0caa-47a1-8dc1-3475e460a03f',
  format: 'uuid',
};

/**
 * Predefined string format options mandating that a string contains non-whitespace characters.
 */
export const nonBlank: StringOptions<StringFormatOption> = {
  pattern: '^.*\\S.*$',
};
