/* eslint-disable no-multi-spaces, object-curly-newline, key-spacing */

import { enums } from '@truck-parking/tp-api';
import { APIError } from '@/common/api/error';

/** Contains all possible pages, even if redirect is not used there */
export type Page = 'Accessibility' | 'Account' | 'DriveOut' | 'EntryGate' | 'ForgotPassword' | 'History' | 'Home' |
  'Instructions' | 'LogIn' | 'Parking' | 'Privacy' | 'SignUp' | 'ThankYou' | 'ToS' | 'VehicleDetails' | 'Welcome'

const redirectionMatrix: Record<Page, Record<enums.UserStatus, Page | null>> = {
  Accessibility:  { idle: null,        cooldown: null,         banned: null,          parking: null },
  Account:        { idle: null,        cooldown: null,         banned: null,          parking: null },
  DriveOut:       { idle: 'Welcome',   cooldown: 'EntryGate',  banned: 'EntryGate',   parking: null },
  EntryGate:      { idle: null,        cooldown: null,         banned: null,          parking: 'Parking' },
  ForgotPassword: { idle: null,        cooldown: null,         banned: null,          parking: null },
  History:        { idle: null,        cooldown: null,         banned: null,          parking: null },
  Home:           { idle: 'Welcome',   cooldown: 'EntryGate',  banned: 'EntryGate',   parking: 'Parking' },
  Instructions:   { idle: null,        cooldown: null,         banned: null,          parking: null },
  LogIn:          { idle: null,        cooldown: null,         banned: null,          parking: null },
  Parking:        { idle: 'Welcome',   cooldown: 'EntryGate',  banned: 'EntryGate',   parking: null },
  Privacy:        { idle: null,        cooldown: null,         banned: null,          parking: null },
  SignUp:         { idle: null,        cooldown: null,         banned: null,          parking: null },
  ThankYou:       { idle: 'Welcome',   cooldown: null,         banned: 'EntryGate',   parking: 'Parking' },
  ToS:            { idle: null,        cooldown: null,         banned: null,          parking: null },
  VehicleDetails: { idle: null,        cooldown: 'EntryGate',  banned: 'EntryGate',   parking: 'Parking' },
  Welcome:        { idle: null,        cooldown: 'EntryGate',  banned: 'EntryGate',   parking: 'Parking' },
};

// eslint-disable-next-line import/prefer-default-export
export const redirect = (source: string, status: enums.UserStatus): Page | null => {
  const target = redirectionMatrix[source as Page];
  if (target === undefined) {
    throw new APIError(
      'Redirection matrix indexed with unregistered page',
      'api-internal-fail',
    );
  }

  if (target[status]) {
    console.info(`Redirecting from ${source} to ${target[status]}`);
  }

  return target[status];
};
