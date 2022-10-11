import Vue from 'vue';
import VueI18n, { LocaleMessages } from 'vue-i18n';
import AppSettings from '@/common/utils/preferences';

Vue.use(VueI18n);

/**
 * Loads i18n locales from given path
 *
 * @param locales
 */
export const loadLocales = (locales: __WebpackModuleApi.RequireContext): LocaleMessages => {
  const messages: LocaleMessages = {};
  locales.keys().forEach((key) => {
    const matched = key.match(/([A-Za-z0-9-_]+)\./i);
    if (matched && matched.length > 1) {
      messages[matched[1] /* lang (like 'fi') */] = locales(key);
    }
  });
  return messages;
};

/**
 * Merges given locales into one.
 *
 * Conflicting translations will be overridden with the ones from overrides.
 *
 * @param base generic locales
 * @param overrides locale overrides
 */
const mergeLocales = (base: LocaleMessages, overrides: LocaleMessages) => {
  const messages: LocaleMessages = {};
  Object.keys(base).forEach((lang) => {
    messages[lang] = { ...base[lang] };
  });

  Object.keys(overrides).forEach((lang) => {
    if (!messages[lang]) {
      messages[lang] = { ...overrides[lang] };
    } else {
      // Merge (overrides overwrites base)
      Object.keys(overrides[lang]).forEach((translation) => {
        messages[lang][translation] = overrides[lang][translation];
      });
    }
  });

  return messages;
};

export const COMMON_LOCALES = loadLocales(
  require.context('./locales', true, /[A-Za-z0-9-_,\s]+\.json$/i),
);

// eslint-disable-next-line import/prefer-default-export
export const initI18n = (appSpecificLocales?: LocaleMessages): VueI18n => new VueI18n({
  locale: AppSettings.language,
  fallbackLocale: AppSettings.fallbackLanguage,
  messages: appSpecificLocales
    ? mergeLocales(COMMON_LOCALES, appSpecificLocales)
    : COMMON_LOCALES,
});
