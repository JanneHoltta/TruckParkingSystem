import { types } from '@truck-parking/tp-api';
import Vue from 'vue';
import 'roboto-fontface/css/roboto/roboto-fontface.css';
import '@mdi/font/css/materialdesignicons.css';
import { RouterConstructor } from '@/common/router';
import { UserVuetifyPreset } from 'vuetify';
import { initVuetify } from '@/common/plugins/vuetify';
import { ToasterOptions } from '@/common/plugins/toaster';
import { LocaleMessages } from 'vue-i18n';
import { Page } from '@/common/api/matrix';
import { initI18n } from './i18n';
import API from './api';

type ChangeRouteFn = (name: Page, query?: Record<string, string | null | undefined | string[]>) => void

// eslint-disable-next-line import/prefer-default-export
export const initApp = (
  routerConstructor: RouterConstructor,
  vuetifyPreset: Partial<UserVuetifyPreset>,
  toasterOptions: Partial<ToasterOptions>,
  localeOverride?: LocaleMessages,
  // eslint-disable-next-line @typescript-eslint/ban-types
): Record<string, object> => {
  Vue.config.productionTip = false;

  // Define global logIn & logOut methods
  const globalState = Vue.observable({ authenticated: false });

  const router = routerConstructor({
    isLoggedIn: () => globalState.authenticated,
  });

  const { vuetify, toaster } = initVuetify(vuetifyPreset, toasterOptions);
  const i18n = initI18n(localeOverride);

  // Implement custom changeRoute function to allow redirects during the route change
  // (https://github.com/vuejs/vue-router/issues/2881#issuecomment-520554378)
  const changeRoute: ChangeRouteFn = (name, query?) => {
    if (router.currentRoute.name !== name || router.currentRoute.query !== query) {
      router.push({ name, query }).then().catch(() => { /* ignore */ });
    }
  };

  const replaceRoute: ChangeRouteFn = (name, query?) => {
    if (router.currentRoute.name !== name || router.currentRoute.query !== query) {
      router.replace({ name, query }).then().catch(() => { /* ignore */ });
    }
  };

  Object.defineProperty(Vue.prototype, '$changeRoute', {
    get() {
      return changeRoute;
    },
  });

  Object.defineProperty(Vue.prototype, '$replaceRoute', {
    get() {
      return replaceRoute;
    },
  });

  const api = new API(
    () => {
      // When API receives unauthenticated response
      globalState.authenticated = false;

      // Redirect user to login
      changeRoute('LogIn', { redirect: router.currentRoute.name });
    },
    i18n,
    toaster,
    router,
  );

  // Consider as logged in if authentication cookie exists
  if (api.hasCookie()) {
    globalState.authenticated = true;
  }

  Object.defineProperty(Vue.prototype, '$api', {
    get() {
      return api;
    },
  });

  Object.defineProperty(Vue.prototype, '$signUp', {
    get() {
      // Make API request to sign up
      return (details: types.Signup): Promise<void> => api.signUp(details)
        .then(
          () => { // On success
            // Change global state
            globalState.authenticated = true;
          },
        );
    },
  });

  Object.defineProperty(Vue.prototype, '$logIn', {
    get() {
      // Make API request to log in
      return (credentials: types.Login): Promise<void> => api.login(credentials)
        .then(
          () => { // On success
            // Change global state
            globalState.authenticated = true;
          },
        );
    },
  });

  Object.defineProperty(Vue.prototype, '$logOut', {
    get() {
      // Make API request to log out
      return (): Promise<void> => api.logout()
        .then(
          () => { // On success
            // Change global state
            globalState.authenticated = false;
          },
        );
    },
  });

  Object.defineProperty(Vue.prototype, '$authenticated', {
    get() { // Returns the current status (signed in <=> true)
      return globalState.authenticated;
    },
  });

  return {
    router,
    i18n,
    vuetify,
  };
};

// Type declaration for global state signedIn
declare module 'vue/types/vue' {
  // eslint-disable-next-line no-shadow
  interface Vue {
    $authenticated: boolean
    $signUp: (details: types.Signup) => Promise<void>
    $logIn: (credentials: types.Login) => Promise<void>
    $logOut: () => Promise<void>
    $api: API
    $changeRoute: ChangeRouteFn
    $replaceRoute: ChangeRouteFn
  }
}
