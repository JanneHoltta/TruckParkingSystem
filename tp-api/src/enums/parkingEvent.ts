/**
 * Defines the failure conditions that can occur when starting a parking event.
 * The Frontend e.g. show appropriate error messages based on this information.
 */
export enum ParkingStartError {
  AlreadyParking = 'alreadyParking',
  AreaFull = 'areaFull',
  Banned = 'banned',
  Cooldown = 'cooldown',
  VehicleBanned = 'VehicleBanned',
  NoVehicleAtGate = 'noVehicleAtGate',
  WaitForPreviousVehicle = 'WaitForPreviousVehicle',
  NoReplyFromGate = 'NoReplyFromGate',
}

/**
 * Defines the failure conditions that can occur when ending a parking event.
 * The Frontend e.g. show appropriate error messages based on this information.
 */
export enum ParkingEndError {
  NotParking = 'notParking',
  NoVehicleAtGate = 'noVehicleAtGate',
  WaitForPreviousVehicle = 'WaitForPreviousVehicle',
  NoReplyFromGate = 'NoReplyFromGate',
}
