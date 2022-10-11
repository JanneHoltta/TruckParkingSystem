import { Model } from 'objection';
import { types } from '@truck-parking/tp-api';

export default class DBUser extends Model implements types.DBUser {
  ID!: string;
  firstName!: string;
  lastName!: string;
  phoneNumber!: string;
  emailAddress!: string;
  company!: string;
  registerDateTime!: string;
  lastLoginDateTime!: string;
  passwordHash!: string;
  confirmationCode!: string | null;
  confirmationCodeCreateDateTime!: string | null;

  static get tableName(): string {
    return 'Users';
  }
}
