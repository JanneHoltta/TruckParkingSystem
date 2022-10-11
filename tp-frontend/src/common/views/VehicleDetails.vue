<template>
  <v-container>
    <v-col>
      <v-col>
        <h1>{{ $t("vehicleDetails-enterDetails") }}</h1>
      </v-col>

      <v-divider />

      <v-col>
        <v-form
          ref="form"
        >
          <v-text-field
            v-model="licensePlate"
            :label="$t('vehicleDetails-licensePlate')"
            :rules="licensePlateRules"
          />
        </v-form>
      </v-col>

      <v-row class="btn">
        <v-col>
          <v-btn
            color="secondary"
            block
            @click="$changeRoute('Welcome')"
          >
            {{ $t("global-cancel") }}
          </v-btn>
        </v-col>

        <v-col>
          <v-btn
            color="success"
            block
            @click.native="sendLicencePlate"
          >
            {{ $t("global-driveIn") }}
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
  name: 'VehicleDetails',
  props: {
    plate: {
      type: String,
      default(): string {
        return '';
      },
    },
  },
  data() {
    return {
      licensePlate: this.plate,
      licensePlateRules: [
        (v: string) => !!v || this.$i18n.t('validation-licensePlateRequired'),
        (v: string) => new RegExp(schemas.parkingEvent.properties.licensePlate.pattern).test(v)
          || this.$i18n.t('validation-licensePlateType'),
        (v: string) => (v && v.length <= schemas.parkingEvent.properties.licensePlate.maxLength)
          || this.$i18n.t('validation-licensePlateMax'),
      ],
    };
  },

  mounted() {
    this.$api.getStatus().then();
  },

  methods: {
    sendLicencePlate() {
      // There is a validate method for the v-form component, but since it does not have a valid
      // TS type, it shows this as an error. Nevertheless the code functions properly.
      if ((this.$refs.form as unknown as { validate(): boolean })?.validate()) {
        this.$changeRoute(
          'EntryGate',
          {
            plate: this.licensePlate.trim().toUpperCase(),
            newVehicle: 'true',
          },
        );
      }
    },
  },
});
</script>
