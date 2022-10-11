import fi from 'vuetify/src/locale/fi';
import { UserVuetifyPreset } from 'vuetify';

export default {
  theme: {
    options: {
      customProperties: true,
    },
    dark: false,
    themes: {
      light: {
        primary: '#356394',
        secondary: '#4f4f4f',
        accent: '#673ab7',
        error: '#e60d12',
        info: '#0957ab',
        success: '#3b8c3e',
        warning: '#FFC107',
      },
      dark: {
        primary: '#406c9c',
        secondary: '#4f4f4f',
        accent: '#673ab7',
        error: '#e60d12',
        info: '#2196f3',
        success: '#3b8c3e',
        warning: '#FFC107',
      },
    },
  },
  lang: {
    locales: { fi },
    current: 'fi',
  },
} as Partial<UserVuetifyPreset>;
