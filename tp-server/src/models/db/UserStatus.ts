import { Model } from 'objection';

export default class UserStatus extends Model {
  ID!: string;
  banEnd!: Date | null;
  parkingEnd!: Date | null;
  parkingExpiry!: Date | null;
  cooldownTime!: number;

  static get tableName(): string {
    return 'UserStatus';
  }
}
