<template>
  <v-menu
    offset-y
    close-on-content-click
  >
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        id="language"
        icon
        v-bind="attrs"
        :aria-label="$t('alt-language')"
        class="mx-2"
        v-on="on"
      >
        <country-flag
          v-if="activeLanguageIcon"
          :country="activeLanguageIcon"
          style="margin: 0"
        />
        <v-icon v-else>
          mdi-web
        </v-icon>
      </v-btn>
    </template>

    <v-list
      id="languageList"
    >
      <v-list-item
        v-for="(language) in languages"
        :id="language.locale"
        :key="language.locale"
        @click="selectLanguage(language.locale)"
      >
        <v-list-item-icon>
          <country-flag :country="language.icon" />
        </v-list-item-icon>
        <v-list-item-content>
          {{ language.language }}
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script lang="ts">
import Vue from 'vue';
import CountryFlag from 'vue-country-flag';
import AppSettings from '@/common/utils/preferences';

export default Vue.extend({
  name: 'LanguageSelector',

  components: {
    CountryFlag,
  },

  data: () => ({
    languages: [
      { language: 'SUOMI', icon: 'fi', locale: 'fi' },
      { language: 'ENGLISH', icon: 'gb', locale: 'en' },
    ],
  }),
  computed: {
    activeLanguageIcon(): string | undefined {
      return this.languages.find((l) => l.locale === this.$root.$i18n.locale)?.icon;
    },
  },
  methods: {
    selectLanguage(locale: string) {
      this.$emit('select', locale);
      this.$root.$i18n.locale = locale;

      // Save selected language to the local storage
      AppSettings.language = locale;
    },
  },
});
</script>
