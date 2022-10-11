/** Manages global settings
 *
 * Settings are stored in browser's local storage.
 */
export default class AppSettings {
  private static THEME_KEY = 'theme'
  private static LANGUAGE_KEY = 'lang'

  /** Is dark theme selected or not */
  static get useDarkTheme(): boolean {
    return localStorage.getItem(AppSettings.THEME_KEY) === 'dark';
  }

  /** Is dark theme selected or not */
  static set useDarkTheme(value: boolean) {
    localStorage.setItem(AppSettings.THEME_KEY, value ? 'dark' : 'light');
  }

  /** Selected language (like 'en' or 'fi') */
  static get language(): string {
    return localStorage.getItem(AppSettings.LANGUAGE_KEY) || process.env.VUE_APP_I18N_LOCALE || 'fi';
  }

  /** Selected language (like 'en' or 'fi') */
  static set language(value: string) {
    localStorage.setItem(AppSettings.LANGUAGE_KEY, value);
  }

  /**
   * Language to use as fallback (like 'en' or 'fi')
   *
   * Used when the selected language misses a translation.
   */
  static get fallbackLanguage(): string {
    return process.env.VUE_APP_I18N_FALLBACK_LOCALE || 'en';
  }
}
