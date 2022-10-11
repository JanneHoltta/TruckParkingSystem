import { Model } from 'objection';
import { types } from '@truck-parking/tp-api';

export default class DBParkingEvent extends Model implements types.DBParkingEvent {
  ID!: string;
  userID!: string;
  startDateTime!: string;
  expiryDateTime!: string;
  endDateTime!: string | null;
  licensePlate!: string;
  licensePlateMatches!: boolean;

  static get tableName(): string {
    return 'ParkingEvents';
  }
}
