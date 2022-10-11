import { Model } from 'objection';
import { types } from '@truck-parking/tp-api';

export default class DBVehicleBan extends Model implements types.DBVehicleBan {
  ID!: string;
  licensePlate!: string;
  reason!: string;
  startDateTime!: string;
  endDateTime!: string;

  static get tableName(): string {
    return 'BannedVehicles';
  }
}
