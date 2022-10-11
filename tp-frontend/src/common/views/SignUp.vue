<template>
  <v-container>
    <v-col class="text-center">
      <v-col>
        <h1>{{ $t("global-signUp") }}</h1>
      </v-col>

      <v-col>
        <v-form
          ref="form"
          @keyup.native.enter="sendSignUp"
        >
          <v-text-field
            id="signUpFirstName"
            v-model="firstName"
            class="required"
            :label="$t('signUp-firstName')"
            :rules="firstNameRules"
          />
          <v-text-field
            id="signUpLastName"
            v-model="lastName"
            class="required"
            :label="$t('signUp-lastName')"
            :rules="lastNameRules"
          />
          <v-text-field
            id="signUpPhone"
            v-model="phone"
            class="required"
            :label="$t('signUp-phone')"
            :rules="phoneRules"
          />
          <v-text-field
            id="signUpEmail"
            v-model="email"
            class="required"
            :label="$t('global-email')"
            :rules="emailRules"
          />
          <v-text-field
            id="signUpCompany"
            v-model="company"
            class="required"
            :label="$t('signUp-company')"
            :rules="companyRules"
          />
          <v-text-field
            id="signUpPassword"
            v-model="password"
            type="password"
            class="required"
            :label="$t('global-password')"
            :rules="passwordRules"
          />
          <v-text-field
            id="signUpPasswordRepeat"
            v-model="passwordRepeat"
            type="password"
            class="required"
            :label="$t('global-repeatPassword')"
            :rules="[passwordConfirmationRule]"
          />
          <v-checkbox
            id="signUpCheckbox"
            :rules="checkBoxRules"
          >
            <template v-slot:label>
              <div>
                {{ $t("signUp-agree") }}
                <RouterLink
                  id="signUpToSLink"
                  :to="{ name: 'ToS' }"
                >
                  {{ $t("global-tos") }}
                </RouterLink>
                <span class="required-symbol">* </span>
              </div>
            </template>
          </v-checkbox>
        </v-form>
        <v-col class="text-left">
          <span class="required-symbol">* </span>
          <span> {{ $t('validation-requiredDescription') }} </span>
        </v-col>
      </v-col>

      <v-col class="btn">
        <v-btn
          id="signUpButton"
          color="info"
          block
          @click.native="sendSignUp"
        >
          {{ $t("global-signUp") }}
        </v-btn>
      </v-col>

      <v-col>
        <p>
          {{ $t("signUp-accountAlready") }}
          <RouterLink
            id="signUpLogInLink"
            :to="{ name: 'LogIn' }"
          >
            {{ $t("global-logIn") }}
          </RouterLink>
        </p>
      </v-col>
    </v-col>
  </v-container>
</template>

<style lang="scss">
.required-symbol {
  font-weight: bold;
}

.required .v-label::after {
  content: " *";
  @extend .required-symbol;
}
</style>

<script lang="ts">
import Vue from 'vue';
import { schemas } from '@truck-parking/tp-api';

export default Vue.extend({
  name: 'SignUp',

  data() {
    return {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      company: '',
      password: '',
      passwordRepeat: '',
      checkbox: false,

      firstNameRules: [
        (v: string) => !!v || this.$i18n.t('validation-firstNameRequired'),
        (v: string) => new RegExp(schemas.signup.properties.firstName.pattern).test(v)
          || this.$i18n.t('validation-nameType'),
        (v: string) => (v && v.length <= schemas.signup.properties.firstName.maxLength)
          || this.$i18n.t('validation-nameMax'),
      ],
      lastNameRules: [
        (v: string) => !!v || this.$i18n.t('validation-lastNameRequired'),
        (v: string) => new RegExp(schemas.signup.properties.lastName.pattern).test(v)
          || this.$i18n.t('validation-nameType'),
        (v: string) => (v && v.length <= schemas.signup.properties.lastName.maxLength)
          || this.$i18n.t('validation-nameMax'),
      ],
      emailRules: [
        (v: string) => !!v || this.$i18n.t('validation-emailRequired'),
        (v: string) => new RegExp(schemas.signup.properties.emailAddress.pattern).test(v)
          || this.$i18n.t('validation-emailType'),
        (v: string) => (v && v.length <= schemas.signup.properties.emailAddress.maxLength)
          || this.$i18n.t('validation-emailMax'),
      ],
      phoneRules: [
        (v: string) => !!v || this.$i18n.t('validation-phoneRequired'),
        (v: string) => new RegExp(schemas.signup.properties.phoneNumber.pattern).test(v)
          || this.$i18n.t('validation-phoneType'),
      ],
      companyRules: [
        (v: string) => !!v || this.$i18n.t('validation-companyRequired'),
        (v: string) => new RegExp(schemas.signup.properties.company.pattern).test(v)
          || this.$i18n.t('validation-companyType'),
        (v: string) => (v && v.length <= schemas.signup.properties.company.maxLength)
          || this.$i18n.t('validation-companyMax'),
      ],
      passwordRules: [
        (v: string) => !!v || this.$i18n.t('validation-passwordRequired'),
        (v: string) => (v && v.length >= schemas.signup.properties.password.minLength)
          || this.$i18n.t('validation-passwordMin'),
        (v: string) => (v && v.length <= schemas.signup.properties.password.maxLength)
          || this.$i18n.t('validation-passwordMax'),
      ],
      checkBoxRules: [
        (v: unknown) => !!v || this.$i18n.t('validation-ToSAccept'),
      ],
    };
  },

  computed: {
    passwordConfirmationRule() {
      return () => this.password === this.passwordRepeat
        || this.$i18n.t('validation-passwordMatch');
    },
  },

  methods: {
    async sendSignUp() {
      // There is a validate method for the v-form component, but since it does not have a valid
      // TS type, it shows this as an error. Nevertheless, the code functions properly.
      if ((this.$refs.form as unknown as { validate(): boolean })?.validate()) {
        this.$signUp({
          password: this.password,
          firstName: this.firstName,
          lastName: this.lastName,
          phoneNumber: this.phone,
          emailAddress: this.email,
          company: this.company,
        })
          .then(
            () => this.$changeRoute('Welcome'),
            () => { /* on failure */ },
          );
      } else {
        // If validation did not pass, focus on the first failed field
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        for (const field of this.$refs.form.$children) { // eslint-disable-line no-restricted-syntax
          if (field.errorBucket.length > 0) {
            field.$refs.input.focus();
            break;
          }
        }
      }
    },
  },
});
</script>
