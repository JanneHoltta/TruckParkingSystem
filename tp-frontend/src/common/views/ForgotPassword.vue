<template>
  <v-container>
    <v-col class="text-center">
      <v-col>
        <h1>{{ $t("forgotPassword-heading") }}</h1>
      </v-col>
      <v-col class="text-left">
        {{ $t("forgotPassword-body") }}
      </v-col>

      <v-col>
        <v-text-field
          ref="email"
          v-model="email"
          :label="$t('global-email')"
          :rules="emailRules"
          :disabled="codeSent"
          @keyup.native.enter="sendCode"
        />

        <v-row class="btn">
          <v-col>
            <v-btn
              color="secondary"
              block
              @click="$changeRoute('LogIn')"
            >
              {{ $t("global-back") }}
            </v-btn>
          </v-col>
          <v-col
            v-if="!codeSent"
            class="btn"
          >
            <v-btn
              color="success"
              block
              @click="sendCode"
            >
              {{ $t("forgotPassword-send") }}
            </v-btn>
          </v-col>
          <v-col
            v-else
            class="btn"
          >
            <v-btn
              color="warning"
              block
              :disabled="wait"
              @click="codeSent = false"
            >
              {{ $t("forgotPassword-editMail") }}
              <v-progress-circular
                v-if="wait"
                class="ml-3 mr-n6"
                indeterminate
              />
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
      <v-col>
        <v-form
          ref="form"
          @keyup.native.enter="resetPassword"
        >
          <v-text-field
            v-model="confirmationCode"
            :label="$t('forgotPassword-confirmationCode')"
            :rules="codeRules"
            :disabled="!codeSent"
          />
          <v-text-field
            v-model="password"
            type="password"
            :label="$t('global-password')"
            :rules="[...passwordRequiredRules, ...passwordRules]"
            :disabled="!codeSent"
          />
          <v-text-field
            v-model="passwordRepeat"
            type="password"
            :label="$t('global-repeatPassword')"
            :rules="[...passwordRequiredRules, passwordConfirmationRule]"
            :disabled="!codeSent"
          />
        </v-form>
      </v-col>

      <v-row class="btn">
        <v-col>
          <v-btn
            color="red"
            block
            :disabled="!codeSent"
            @click="resetPassword"
          >
            {{ $t("forgotPassword-resetPassword") }}
          </v-btn>
        </v-col>
      </v-row>
    </v-col>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import { schemas } from '@truck-parking/tp-api';

export default Vue.extend({
  name: 'ForgotPassword',

  data() {
    return {
      email: '',
      codeSent: false,
      wait: false,
      confirmationCode: '',
      password: '',
      passwordRepeat: '',

      emailRules: [
        (v: string) => !!v || this.$i18n.t('validation-emailRequired'),
        (v: string) => new RegExp(schemas.signup.properties.emailAddress.pattern).test(v)
          || this.$i18n.t('validation-emailType'),
      ],
      codeRules: [
        (v: string) => new RegExp(schemas.confirmationCode.pattern || '').test(v)
          || this.$i18n.t('validation-confirmationCode'),
      ],
      passwordRequiredRules: [
        (v: string) => !!v || this.$i18n.t('validation-passwordRequired'),
      ],
      passwordRules: [
        (v: string) => (v && v.length >= schemas.signup.properties.password.minLength)
          || this.$i18n.t('validation-passwordMin'),
        (v: string) => (v && v.length <= schemas.signup.properties.password.maxLength)
          || this.$i18n.t('validation-passwordMax'),
      ],
    };
  },

  computed: {
    passwordConfirmationRule() {
      return () => this.password === this.passwordRepeat
        || this.$i18n.t('validation-passwordMatch');
    },
  },

  mounted() {
    // Focus the email field in the beginning for correct input validation, as it is not part of form
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this.$refs.email.$refs.input.focus();
  },

  methods: {
    async sendCode() {
      // There is a validate method for the v-form component, but since it does not have a valid
      // TS type, it shows this as an error. Nevertheless the code functions properly.
      if ((this.$refs.email as unknown as { validate(): boolean })?.validate()) {
        this.codeSent = true;
        this.wait = true;
        this.$api.sendCode({ emailAddress: this.email })
          .then(
            () => {
              this.$toaster.success(this.$i18n.t('forgotPassword-codeSent').toString());
              this.wait = false;
            },
            () => { this.codeSent = false; },
          );
      }
    },
    async resetPassword() {
      // There is a validate method for the v-form component, but since it does not have a valid
      // TS type, it shows this as an error. Nevertheless the code functions properly.
      if ((this.$refs.form as unknown as { validate(): boolean })?.validate()) {
        this.$api.resetPassword({
          emailAddress: this.email,
          password: this.password,
          confirmationCode: this.confirmationCode,
        })
          .then(() => {
            this.$toaster.success(this.$i18n.t('forgotPassword-resetSuccess').toString());
            this.$changeRoute('LogIn');
          });
      }
    },
  },
});
</script>
