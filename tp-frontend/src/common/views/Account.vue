<template>
  <v-container>
    <v-col>
      <v-col>
        <h1>{{ $t("global-myDetails") }}</h1>
      </v-col>

      <v-divider />

      <v-col>
        <v-skeleton-loader
          v-if="loading"
          class="mx-auto"
          type="paragraph"
        />
        <template v-else>
          <p>{{ $t("account-description") }}</p>
          <v-form
            ref="form"
          >
            <v-text-field
              v-model="newInfo.firstName"
              :label="$t('signUp-firstName')"
              :rules="firstNameRules"
            />
            <v-text-field
              v-model="newInfo.lastName"
              :label="$t('signUp-lastName')"
              :rules="lastNameRules"
            />
            <v-text-field
              v-model="newInfo.phoneNumber"
              :label="$t('signUp-phone')"
              :rules="phoneRules"
            />
            <v-text-field
              v-model="newInfo.emailAddress"
              :label="$t('global-email')"
              :rules="emailRules"
            />
            <v-text-field
              v-model="newInfo.company"
              :label="$t('signUp-company')"
              :rules="companyRules"
            />
            <p class="mt-6 mb-3">
              {{ $t("account-passwordDescription") }}
            </p>
            <v-text-field
              v-model="password"
              type="password"
              :label="$t('global-password')"
              :rules="passwordRules"
            />
            <v-text-field
              v-model="passwordRepeat"
              type="password"
              :label="$t('global-repeatPassword')"
              :rules="[passwordConfirmationRule]"
            />
          </v-form>
        </template>
      </v-col>

      <v-row class="btn">
        <v-col v-if="!loading">
          <v-btn
            color="success"
            block
            :disabled="!fieldsUpdated"
            @click="sendUserUpdate()"
          >
            {{ $t("account-save") }}
          </v-btn>
        </v-col>
      </v-row>
    </v-col>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import { schemas, types } from '@truck-parking/tp-api';

export default Vue.extend({
  name: 'Account',

  data() {
    const emptyInfo = (): types.PersonalInfo => ({
      firstName: '',
      lastName: '',
      phoneNumber: '',
      emailAddress: '',
      company: '',
    });

    return {
      loading: true,
      oldInfo: emptyInfo(),
      newInfo: emptyInfo(),

      password: '',
      passwordRepeat: '',

      firstNameRules: [
        (v: string) => !!v || this.$i18n.t('validation-firstNameRequired'),
        (v: string) => new RegExp(schemas.fullPersonalInfo.properties.firstName.pattern).test(v)
          || this.$i18n.t('validation-nameType'),
        (v: string) => (v && v.length <= schemas.fullPersonalInfo.properties.firstName.maxLength)
          || this.$i18n.t('validation-nameMax'),
      ],
      lastNameRules: [
        (v: string) => !!v || this.$i18n.t('validation-lastNameRequired'),
        (v: string) => new RegExp(schemas.fullPersonalInfo.properties.lastName.pattern).test(v)
          || this.$i18n.t('validation-nameType'),
        (v: string) => (v && v.length <= schemas.fullPersonalInfo.properties.lastName.maxLength)
          || this.$i18n.t('validation-nameMax'),
      ],
      emailRules: [
        (v: string) => !!v || this.$i18n.t('validation-emailRequired'),
        (v: string) => new RegExp(schemas.fullPersonalInfo.properties.emailAddress.pattern).test(v)
          || this.$i18n.t('validation-emailType'),
        (v: string) => (v && v.length <= schemas.fullPersonalInfo.properties.emailAddress.maxLength)
          || this.$i18n.t('validation-emailMax'),
      ],
      phoneRules: [
        (v: string) => !!v || this.$i18n.t('validation-phoneRequired'),
        (v: string) => new RegExp(schemas.fullPersonalInfo.properties.phoneNumber.pattern).test(v)
          || this.$i18n.t('validation-phoneType'),
      ],
      companyRules: [
        (v: string) => !!v || this.$i18n.t('validation-companyRequired'),
        (v: string) => new RegExp(schemas.fullPersonalInfo.properties.company.pattern).test(v)
          || this.$i18n.t('validation-companyType'),
        (v: string) => (v && v.length <= schemas.fullPersonalInfo.properties.company.maxLength)
          || this.$i18n.t('validation-companyMax'),
      ],
      passwordRules: [
        (v: string) => (!v || v.length >= schemas.fullPersonalInfo.properties.password.minLength)
          || this.$i18n.t('validation-passwordMin'),
        (v: string) => (!v || v.length <= schemas.fullPersonalInfo.properties.password.maxLength)
          || this.$i18n.t('validation-passwordMax'),
      ],
    };
  },

  computed: {
    passwordConfirmationRule() {
      return () => this.password === this.passwordRepeat
        || this.$i18n.t('validation-passwordMatch');
    },

    fieldsUpdated(): boolean {
      return Object.keys(this.newInfo).some((k: string) => {
        const key = k as keyof types.PersonalInfo;
        return this.newInfo[key] !== this.oldInfo[key];
      }) || !!this.password || !!this.passwordRepeat;
    },
  },

  mounted() {
    this.$api.getUser().then((userStatus) => {
      // Both old and new info start off as the user's current details
      this.oldInfo = { ...userStatus.body };
      this.newInfo = { ...userStatus.body };
      this.loading = false;
    });
  },

  methods: {
    async sendUserUpdate() {
      // Create a diff object with the changed fields between old and new
      const diff = Object.fromEntries(Object.entries(this.newInfo).filter(([k]) => {
        const key = k as keyof types.PersonalInfo;
        return this.newInfo[key] !== this.oldInfo[key];
      }));

      // There is a validate method for the v-form component, but since it does not have a valid
      // TS type, it shows this as an error. Nevertheless, the code functions properly.
      if ((this.$refs.form as unknown as { validate(): boolean })?.validate()) {
        this.$api.updateUser((this.password) ? { ...diff, password: this.password } : diff)
          .then(() => { // Update succeeded
            // Update reference info if the update succeeded and clear password fields
            this.oldInfo = { ...this.newInfo };
            this.password = '';
            this.passwordRepeat = '';

            this.$toaster.success(this.$i18n.t('account-updateSuccess').toString());
          }, () => { /* Update failed */ });
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
