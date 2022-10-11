/**
 * Defines a set of states some user can be in. The Frontend e.g. decides
 * the view it should show when a user logs in based on this information.
 */
// eslint-disable-next-line import/prefer-default-export
export enum UserStatus {
  Banned = 'banned',
  Cooldown = 'cooldown',
  Parking = 'parking',
  Idle = 'idle',
}
