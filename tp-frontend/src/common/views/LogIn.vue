<template>
  <v-container>
    <v-col class="text-center">
      <v-col>
        <h1>{{ $t("global-logIn") }}</h1>
      </v-col>

      <v-col>
        <v-form
          ref="form"
          @keyup.native.enter="sendLogIn"
        >
          <v-text-field
            id="loginEmail"
            v-model="email"
            :label="$t('global-email')"
            :rules="emailRules"
          />
          <v-text-field
            id="loginPassword"
            v-model="password"
            type="password"
            :label="$t('global-password')"
            :rules="passwordRules"
          />
        </v-form>
      </v-col>

      <v-col class="btn">
        <v-btn
          id="logInButton"
          color="success"
          block
          @click="sendLogIn"
        >
          {{ $t("global-logIn") }}
        </v-btn>
      </v-col>

      <v-col>
        <p>
          {{ $t("logIn-toSignUp") }}
          <RouterLink
            id="loginSignUpLink"
            :to="{ name: 'SignUp' }"
          >
            {{ $t("global-signUp") }}
          </RouterLink>
        </p>
      </v-col>
      <v-col>
        <p>
          <RouterLink
            id="loginForgotPasswordLink"
            :to="{ name: 'ForgotPassword' }"
          >
            {{ $t("logIn-forgotPassword") }}
          </RouterLink>
        </p>
      </v-col>
    </v-col>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import { Page } from '@/common/api/matrix';

export default Vue.extend({
  name: 'LogIn',
  props: {
    redirect: {
      type: String,
      default: 'Welcome',
    },
  },
  data() {
    return {
      email: '',
      password: '',

      emailRules: [
        (v: string) => !!v || this.$i18n.t('validation-emailRequired'),
      ],
      passwordRules: [
        (v: string) => !!v || this.$i18n.t('validation-passwordRequired'),
      ],
    };
  },

  methods: {
    async sendLogIn() {
      // There is a validate method for the v-form component, but since it does not have a valid
      // TS type, it shows this as an error. Nevertheless the code functions properly.
      if ((this.$refs.form as unknown as { validate(): boolean })?.validate()) {
        this.$logIn({
          username: this.email,
          password: this.password,
        })
          .then(() => this.$changeRoute(this.redirect as Page));
      }
    },
  },
});
</script>
