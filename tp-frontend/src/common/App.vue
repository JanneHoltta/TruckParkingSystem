<template>
  <v-app>
    <v-app-bar
      app
      color="primary"
      :height="appBarHeight"
    >
      <router-link
        v-if="$authenticated"
        id="logoHomeLink"
        :to="{ name: 'Welcome' }"
        :aria-label="$t('alt-logo')"
      >
        <v-img
          :src="headerImg()"
          contain
          width="150"
          :height="appBarHeight"
        />
      </router-link>
      <router-link
        v-else
        id="logoHomeLink"
        :to="{ name: 'Home' }"
        :aria-label="$t('alt-logo')"
      >
        <v-img
          :src="headerImg()"
          contain
          width="150"
          :height="appBarHeight"
        />
      </router-link>

      <v-spacer />

      <div>
        <!-- Header button for welcome/parking -->
        <v-btn
          id="headerParkingButton"
          icon
          :aria-label="$t('alt-parking')"
          @click="changeRoute('Welcome')"
        >
          <v-icon>
            mdi-parking
          </v-icon>
        </v-btn>

        <!-- Button for language selection -->
        <language-selector />
      </div>

      <!-- Burger menu -->
      <v-app-bar-nav-icon
        id="headerMenuButton"
        class="mx-1"
        :aria-label="$t('alt-sideMenu')"
        @click="drawerOpen = true"
      />
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawerOpen"
      fixed
      temporary
      right
    >
      <!-- Buttons for pages defined in menuLinks -->
      <v-list :style="{ 'margin-top': appBarHeight }">
        <!-- Don't use :to property as it deactivates the button for the current page -->
        <v-list-item
          v-for="link in menuLinks"
          :id="link.id"
          :key="link.tag"
          @click="changeRoute(link.route); drawerOpen = false"
        >
          <v-list-item-icon>
            <v-icon> {{ link.icon }} </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            {{ $t(link.tag) }}
          </v-list-item-content>
        </v-list-item>
      </v-list>

      <!-- Button for toggling between light and dark mode -->
      <v-list>
        <v-list-item
          id="menuTheme"
          @click="darkMode = !darkMode; drawerOpen = false"
        >
          <v-list-item-icon>
            <v-icon> {{ themeToggleIcon }} </v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            {{ themeToggleText }}
          </v-list-item-content>
        </v-list-item>

        <!-- Button(s) for logout / login & signup -->
        <v-list-item>
          <div
            class="my-2"
            style="display: flex; flex-direction: column; width: 100%; margin: 0"
          >
            <v-btn
              v-if="$authenticated"
              id="menuLogOut"
              color="error"
              class="account-btn my-1"
              depressed
              @click="sendLogOut"
            >
              {{ $t("global-logOut") }}
            </v-btn>
            <template v-else>
              <v-btn
                id="menuLogIn"
                color="success"
                class="account-btn my-1"
                depressed
                @click="changeRoute('LogIn')"
              >
                {{ $t("global-logIn") }}
              </v-btn>

              <v-btn
                id="menuSignUp"
                color="primary"
                class="account-btn my-1"
                depressed
                @click="changeRoute('SignUp')"
              >
                {{ $t("global-signUp") }}
              </v-btn>
            </template>
          </div>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main>
      <router-view :logo-img="logoImg" />
    </v-main>

    <v-footer color="black">
      <v-row
        justify="center"
        no-gutters
        class="mt-3"
      >
        <v-col
          class="black py-4 text-center white--text text-body-2"
          cols="12"
        >
          Copyright &copy; {{ $t("global-companyName") }} {{ copyrightYear }} —
          {{ $t("footer-rightsReserved") }}
        </v-col>
      </v-row>
    </v-footer>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue';
import LanguageSelector from '@/common/components/LanguageSelector.vue';
import AppSettings from '@/common/utils/preferences';
import { Page } from '@/common/api/matrix';

export default Vue.extend({
  name: 'App',
  components: { LanguageSelector },
  props: {
    headerImg: {
      type: Function,
      required: true,
    },
    logoImg: {
      type: Function,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
  data: () => ({
    appBarHeight: '75px',
    drawerOpen: false,
    langDrawerOpen: false,
    copyrightYear: process.env.BUILD_YEAR,
  }),

  computed: {
    darkMode: {
      get(): boolean { return this.$vuetify.theme.dark; },
      set(value: boolean) { this.$vuetify.theme.dark = value; },
    },
    themeToggleIcon() {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return this.darkMode ? 'mdi-white-balance-sunny' : 'mdi-weather-night';
    },
    themeToggleText() {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return this.$t(this.darkMode ? 'header-lightMode' : 'header-darkMode');
    },
    menuLinks() {
      const links = [];

      if (this.$authenticated) {
        links.push(
          {
            order: 0, icon: 'mdi-parking', tag: 'global-sideMenuToParking', route: 'Welcome', id: 'menuParking',
          },
          {
            order: 2, icon: 'mdi-history', tag: 'global-viewHistory', route: 'History', id: 'menuHistory',
          },
          {
            order: 3, icon: 'mdi-account-details', tag: 'global-myDetails', route: 'Account', id: 'menuDetails',
          },
        );
      }

      links.push(
        {
          order: 1, icon: 'mdi-help-circle', tag: 'header-instructions', route: 'Instructions', id: 'menuInstructions',
        },
        {
          order: 4, icon: 'mdi-book-open-page-variant', tag: 'global-tos', route: 'ToS', id: 'menuTos',
        },
        {
          order: 5, icon: 'mdi-shield-account', tag: 'global-privacy', route: 'Privacy', id: 'menuPrivacy',
        },
        {
          order: 6, icon: 'mdi-lifebuoy', tag: 'footer-accessibility', route: 'Accessibility', id: 'menuAccessibility',
        },
      );

      return links.sort((a, b) => 0 - (a.order > b.order ? -1 : 1));
    },
  },

  watch: {
    drawerOpen() {
      this.langDrawerOpen = false;
    },
    // Save selected theme to the local storage when changed
    // eslint-disable-next-line func-names
    '$vuetify.theme.dark': function (value) {
      AppSettings.useDarkTheme = value;
    },
  },

  created() {
    // Set page title
    document.title = this.title;

    // Load theme settings
    this.$vuetify.theme.dark = AppSettings.useDarkTheme;
  },

  methods: {
    async sendLogOut(): Promise<void> {
      this.$logOut().then(() => this.$changeRoute('Home'));
    },
    changeRoute(name: string) {
      this.$changeRoute(name as Page);
    },
  },
});
</script>

<style lang="scss">
.v-app-bar {
  z-index: 8 !important
}
</style>

<style scoped lang="scss">
  .account-btn {
    display: flex !important;
    flex: 1 0 auto !important;
  }
</style>
