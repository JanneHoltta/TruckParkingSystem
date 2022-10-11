<template>
  <v-container>
    <v-col class="text-center">
      <v-col class="mb-4">
        <h2 class="subheading font-weight-bold pt-12">
          {{ $t("home-heading") }}
        </h2>
        <!-- Use the btn class to set the max width -->
        <v-col class="btn">
          <v-img
            :src="logoImg()"
            :alt="$t('global-companyName')"
          />
        </v-col>
        <FreeParkingSpaces />
      </v-col>

      <div v-if="!this.$authenticated">
        <v-col class="btn">
          <v-btn
            block
            color="success"
            :to="{ name: 'LogIn' }"
          >
            {{ $t("global-logIn") }}
          </v-btn>
        </v-col>

        <v-col class="btn">
          <v-btn
            block
            color="info"
            :to="{ name: 'SignUp' }"
          >
            {{ $t("global-signUp") }}
          </v-btn>
        </v-col>
      </div>

      <div v-else>
        <v-col class="btn">
          <v-btn
            block
            color="success"
            :to="{ name: 'Welcome' }"
          >
            {{ $t("global-toParking") }}
          </v-btn>
        </v-col>
      </div>

      <v-col class="my-5">
        <h2 class="headline font-weight-bold mb-3 text-left">
          {{ $t("home-bodyHeading") }}
        </h2>

        <p
          v-for="paragraph in body"
          :key="paragraph"
          class="text-left"
          v-text="paragraph"
        />
      </v-col>
    </v-col>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import { LocaleMessage } from 'vue-i18n';

import FreeParkingSpaces from '../components/FreeParkingSpaces.vue';

export default Vue.extend({
  name: 'Home',
  components: {
    FreeParkingSpaces,
  },
  props: {
    logoImg: {
      type: Function,
      required: true,
    },
  },
  computed: {
    body(): LocaleMessage[] {
      return [
        this.$i18n.t('home-body1'),
        this.$i18n.t('home-body2'),
        this.$i18n.t('home-body3'),
      ];
    },
  },
  mounted() {
    if (this.$authenticated) {
      // Call api to use redirection matrix (ignore fetched data)
      this.$api.getStatus().then();
    }
  },
});
</script>
