import { types } from '@truck-parking/tp-api';
import Vue from 'vue';
import vuetifyPreset from '@/rekkaparkki/vuetifyPreset';
import toasterOptions from '@/rekkaparkki/toasterOptions';
import { initApp } from '@/common/app';
import { loadLocales } from '@/common/i18n';
import App from '../common/App.vue';
import Router from './router';
import 'roboto-fontface/css/roboto/roboto-fontface.css';
import '@mdi/font/css/materialdesignicons.css';
import API from '../common/api';

/** Load app-specific locales */
const APP_SPECIFIC_LOCALES = loadLocales(
  require.context('./locales', true, /[A-Za-z0-9-_,\s]+\.json$/i),
);

const components = initApp(Router, vuetifyPreset, toasterOptions, APP_SPECIFIC_LOCALES);

// Create & configure Vue instance
new Vue({
  ...components,
  render: (h) => h(
    App,
    {
      props: {
        // eslint-disable-next-line global-require
        headerImg: () => require('./assets/rekkaparkki_white.png'),
        // eslint-disable-next-line global-require
        logoImg: () => require('./assets/rekkaparkki_transparent.png'),
        title: 'Rekkaparkki',
      },
    },
  ),
}).$mount('#app');

// Type declaration for global state signedIn
declare module 'vue/types/vue' {
  // eslint-disable-next-line no-shadow
  interface Vue {
    $authenticated: boolean
    $signUp: (details: types.Signup) => Promise<void>
    $logIn: (credentials: types.Login) => Promise<void>
    $logOut: () => Promise<void>
    $api: API
  }
}
