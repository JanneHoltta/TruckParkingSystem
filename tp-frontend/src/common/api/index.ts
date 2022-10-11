import axios from 'axios';
import { enums, types } from '@truck-parking/tp-api';
import VueI18n from 'vue-i18n';
import { BaseAPI } from '@/common/api/api';
import { ToasterMethods } from '@/common/plugins/toaster';
import VueRouter from 'vue-router';
import {
  acceptOnly,
  EmbeddedStatus,
  reject,
} from './utils';

type SessionResponse<T> = Promise<EmbeddedStatus<T>>;

/** This class is responsible for the backend communication.
 *
 * Each api endpoint has its own method here in API. Methods are returning promises that resolve
 * only after the backend replies with an accepting status code. If anything goes wrong during the
 * request, the promises returned from the API methods should reject. In that case, the API takes
 * care of displaying an informative and internationalized error toast for the user.
 */
export default class API extends BaseAPI {
  constructor(onUnauthenticatedResponse: () => void, i18n: VueI18n, toaster: ToasterMethods, router: VueRouter) {
    super(
      onUnauthenticatedResponse,
      i18n,
      toaster,
      router,
      {
        authCookieName: '__Secure-Session-Token',
        authHeaderName: 'X-Session-Token',
      },
    );
  }

  /**
   * How api endpoints are implemented:
   *
   * The API methods depend on the axios library. One notable difference is that the axios will
   * resolve with any response status code, even with the 5xx ones. The status code based validation
   * must be done in separately each method.
   *
   * To make it simpler, there exists three utility functions: reject, acceptOnly and inspectError.
   * The intended usage for these is somewhat similar to the factory model approach; but the
   * chaining of the rules is done using the native chaining methods of js Promises.
   *
   * Each method start with an axios call. The utility functions are then chained to the promise it
   * returns. The logic behind those rules tries to imitate a simple firewall rule set. They should
   * be chained in the following order:
   *   1. reject (blacklists a single response status code)
   *   2. acceptOnly{,Transform} (specifies a whitelist for responses to be accepted)
   *   3. inspectError (catches rejections and toasts an appropriate error message for the user)
   *
   * In most scenarios, only the acceptOnly and inspectError functions are required. Note, that one
   * reject or acceptOnly block can give only errors with one specific message. For example, the
   * acceptOnly rejects the responses with the same error message, so if some response status code
   * should lead to a more specific error message, a reject can be chained before the acceptOnly.
   *
   * Inspect error is always required and should be chained using Promise.catch. This way it catches
   * all errors thrown during any part of the promise chain, also the ones thrown by axios.
   *
   * More specific information about the utility functions can be found on their documentation.
   */

  /** Logs in using the given credentials
   *
   * @param credentials credentials to use
   */
  login(credentials: types.Login): Promise<void> {
    return axios.post('/login', credentials)
      .then(reject(403, { message: 'Invalid credentials', i18nKey: 'api-invalid-credentials' }))
      .then(acceptOnly<void>(204, 'api-logIn-fail'))
      .catch(this.inspectError());
  }

  /** Signs up with the given user details
   *
   * @param details user details
   */
  signUp(details: types.Signup): Promise<void> {
    return axios.post('/signup', details)
      .then(reject(409, { message: 'User with this email already exists', i18nKey: 'api-user-email-exists' }))
      .then(acceptOnly<void>(204, 'api-signUp-fail'))
      .catch(this.inspectError());
  }

  /** Fetches the number of free parking spaces */
  getFreeParkingSpaces(): Promise<types.FreeParkingSpaces> {
    return axios.get('/freeParkingSpaces')
      .then(acceptOnly<types.FreeParkingSpaces>(200, 'api-freeParkingSpaces-fail'))
      .catch(this.inspectError());
  }

  /** Logs out */
  logout(): Promise<void> {
    return axios.post('/logout')
      .then(acceptOnly<void>(204, 'api-logOut-fail'))
      .catch(this.inspectError());
  }

  /** Sends confirmation code for passwordreset */
  sendCode(details: types.ConfirmationCodeRequest): Promise<void> {
    return axios.post('/sendConfirmationCode', details)
      .then(acceptOnly<void>(204, 'api-confirmationCodeSent-fail'))
      .catch(this.inspectError());
  }

  /** Resets password */
  resetPassword(details: types.ResetPassword): Promise<void> {
    return axios.post('/resetPassword', details)
      .then(reject(409, { message: 'Confirmation code not valid', i18nKey: 'api-codeNotValid' }))
      .then(acceptOnly<void>(204, 'api-passwordReset-fail'))
      .catch(this.inspectError());
  }

  /** Starts a new parking event with the given details
   *
   * @param details parking event details
   */
  newParkingEvent(details: types.StartParkingEvent): SessionResponse<types.ParkingEvent> {
    return this.sessionAxios.post('/parkingEvents', details)
      .then(reject(409, (res) => {
        switch (res.data.reason) {
          case enums.ParkingStartError.AlreadyParking:
            return { message: 'User already parking', i18nKey: 'api-already-parking' };
          case enums.ParkingStartError.AreaFull:
            return { message: 'Parking area full', i18nKey: 'api-area-full' };
          case enums.ParkingStartError.Banned:
            return { message: 'User banned', i18nKey: 'entryGate-ban' };
          case enums.ParkingStartError.Cooldown:
            return { message: 'User on cooldown', i18nKey: 'entryGate-cooldown' };
          case enums.ParkingStartError.NoVehicleAtGate:
            return { message: 'Vehicle not at gate', i18nKey: 'api-no-vehicle-at-gate' };
          case enums.ParkingStartError.VehicleBanned:
            return { message: 'Vehicle banned', i18nKey: 'api-vehicle-banned' };
          case enums.ParkingStartError.WaitForPreviousVehicle:
            return { message: 'Wait for previous vehicle', i18nKey: 'api-wait-for-previous-vehicle' };
          case enums.ParkingStartError.NoReplyFromGate:
            return { message: 'No reply from gate controller', i18nKey: 'api-no-reply-from-gate' };
          default:
            return { message: 'Unknown 409 error', i18nKey: 'api-newParkingEvent-fail' };
        }
      }))
      .then(this.acceptOnlyWithStatus(201, 'api-newParkingEvent-fail'))
      .catch(this.inspectError());
  }

  /** Fetches all parking events */
  getParkingEvents(): SessionResponse<types.ParkingEventHistory> {
    return this.sessionAxios.get('/parkingEvents')
      .then(this.acceptOnlyWithStatus(200, 'api-parkingEvents-fail'))
      .catch(this.inspectError());
  }

  /** Fetches the list of recently driven in vehicles */
  getRecentVehicles(): SessionResponse<types.RecentVehicles> {
    return this.sessionAxios.get('/recentVehicles')
      .then(this.acceptOnlyWithStatus(200, 'api-recentVehicles-fail'))
      .catch(this.inspectError());
  }

  /** Fetches the user information */
  getUser(): SessionResponse<types.User> {
    return this.sessionAxios.get('/user')
      .then(this.acceptOnlyWithStatus(200, 'api-userDetails-fail'))
      .catch(this.inspectError());
  }

  getStatus(): SessionResponse<types.UserStatus> {
    return this.sessionAxios.get('/status')
      .then(this.acceptOnlyWithStatus(204, 'api-internal-error'))
      .catch(this.inspectError());
  }

  /** Sends updated user details to backend */
  async updateUser(details: types.PersonalInfoUpdate): SessionResponse<types.User> {
    return this.sessionAxios.patch('/user', details)
      .then(reject(409, { message: 'Given email already exists', i18nKey: 'api-user-email-exists' }))
      .then(this.acceptOnlyWithStatus(200, 'api-userDetails-update-fail'))
      .catch(this.inspectError());
  }

  /** Fetches the current parking event.
   * Returns the parking event or null if there is no ongoing parking event.
   */
  async getCurrentParkingEvent(): SessionResponse<types.ParkingEvent | null> {
    return this.sessionAxios.get('/parkingEvents/current')
      .then(this.acceptOnlyTransformWithStatus<types.ParkingEvent, types.ParkingEvent | null>({
        200: (res) => res,
        204: () => null,
      }, 'api-ParkingEvents-fail'))
      .catch(this.inspectError());
  }

  /** Ends the currently ongoing parking event */
  async endCurrentParkingEvent(): SessionResponse<types.ParkingEvent> {
    return this.sessionAxios.patch('/parkingEvents/current/end')
      .then(reject(409, (res) => {
        switch (res.data.reason) {
          case enums.ParkingEndError.NotParking:
            return { message: 'No ongoing parking event', i18nKey: 'api-no-parking-event' };
          case enums.ParkingEndError.NoVehicleAtGate:
            return { message: 'Vehicle not at gate', i18nKey: 'api-no-vehicle-at-gate' };
          case enums.ParkingEndError.WaitForPreviousVehicle:
            return { message: 'Wait for previous vehicle', i18nKey: 'api-wait-for-previous-vehicle' };
          case enums.ParkingEndError.NoReplyFromGate:
            return { message: 'No reply from gate controller', i18nKey: 'api-no-reply-from-gate' };
          default:
            return { message: 'Unknown 409 error', i18nKey: 'api-newParkingEvent-fail' };
        }
      }))
      .then(this.acceptOnlyWithStatus(200, 'api-endParkingEvent-fail'))
      .catch(this.inspectError());
  }

  /** Fetches the currently active bans for the user */
  async getCurrentBans(): SessionResponse<types.CurrentBans> {
    return this.sessionAxios.get('/ban')
      .then(this.acceptOnlyWithStatus(200, 'api-currentBans-fail'))
      .catch(this.inspectError());
  }
}
