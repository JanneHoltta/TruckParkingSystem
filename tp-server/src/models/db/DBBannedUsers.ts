import { Model } from 'objection';
import { types } from '@truck-parking/tp-api';

export default class DBBannedUsers extends Model implements types.DBBan {
  ID!: string;
  userID!: string;
  reason!: string;
  startDateTime!: string;
  endDateTime!: string;

  static get tableName(): string {
    return 'BannedUsers';
  }
}
