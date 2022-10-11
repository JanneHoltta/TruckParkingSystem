import { Static } from '@sinclair/typebox';
import * as schemas from '../schemas/ban';

/** Static type of the {@link schemas.banID} object */
export type BanID = Static<typeof schemas.banID>;
/** Static type of the {@link schemas.ban} object */
export type Ban = Static<typeof schemas.ban>;
/** Static type of the {@link schemas.newBan} object */
export type NewBan = Static<typeof schemas.newBan>;
/** Static type of the {@link schemas.currentBans} object */
export type CurrentBans = Static<typeof schemas.currentBans>;
/** Static type of the {@link schemas.dbBan} object */
export type DBBan = Static<typeof schemas.dbBan>;
/** Static type of the {@link schemas.bans} object */
export type Bans = Static<typeof schemas.bans>;
