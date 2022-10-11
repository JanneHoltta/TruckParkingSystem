<template>
  <v-container>
    <v-col v-if="parkingAllowed">
      <v-col>
        <h1>{{ $t("entryGate-driveIn") + " " + plate }}</h1>
      </v-col>

      <v-divider />

      <v-col>
        <p>{{ $t("entryGate-goToGate") }}</p>
      </v-col>
      <v-row class="btn">
        <v-col>
          <v-btn
            v-if="!!newVehicle"
            color="secondary"
            block
            @click="$changeRoute('VehicleDetails', { plate })"
          >
            {{ $t("global-cancel") }}
          </v-btn>
          <v-btn
            v-else
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
            @click="sendNewParkingEvent()"
          >
            {{ $t("entryGate-openGate") }}
          </v-btn>
        </v-col>
      </v-row>
    </v-col>
    <div v-else>
      <v-col class="text-center">
        <v-skeleton-loader
          v-if="loading"
          loading
          type="text"
          style="width: 40%"
          class="mx-auto"
        />
        <h2 v-else>
          {{ $t(reason) }} {{ $t("entryGate-parkIn") }}
        </h2>
      </v-col>
      <v-col>
        <timer
          :loading="loading"
          color="accent"
          expired-color="success"
          :start-date-time="startTime"
          :expiry-date-time="parkingAllowedAt"
          @expired="timerExpired = true"
        />
      </v-col>
      <v-col
        v-if="timerExpired"
        class="btn"
      >
        <v-btn
          color="success"
          class="my-2"
          block
          @click="$changeRoute('Welcome')"
        >
          {{ $t('entryGate-toParking') }}
        </v-btn>
      </v-col>
    </div>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import { enums } from '@truck-parking/tp-api';
import Timer from '../components/Timer.vue';

export default Vue.extend({
  name: 'EntryGate',
  components: { Timer },
  props: {
    plate: {
      type: String,
      default(): string {
        return '';
      },
    },
    newVehicle: {
      type: String,
      default(): string {
        return '';
      },
    },
  },
  data() {
    return {
      loading: true,
      parkingAllowedAt: null as string | null,
      parkingAllowed: false,
      startTime: null as string | null,
      reason: '',
      timerExpired: false,
    };
  },
  mounted() {
    this.$api.getStatus().then(({ userStatus }) => {
      this.parkingAllowed = userStatus.status === enums.UserStatus.Idle;
      this.parkingAllowedAt = userStatus.nextParkingAllowed;
      if (userStatus.status === enums.UserStatus.Idle && this.plate === '') {
        // Redirect to welcome page if no license plate given
        this.$changeRoute('VehicleDetails');
        this.$toaster.warning(this.$i18n.t('entryGate-noLicensePlate').toString());
      }
      if (userStatus.status === enums.UserStatus.Cooldown) {
        this.reason = 'entryGate-cooldown';
        this.$api.getParkingEvents().then(({ body: pe }) => {
          this.startTime = pe.parkingEvents[0].endDateTime;
        });
      }
      if (userStatus.status === enums.UserStatus.Banned) {
        this.reason = 'entryGate-ban';
        this.$api.getCurrentBans().then(({ body: bans }) => {
          // If user status is banned and no current bans, something weird happened
          if (bans.currentBans.length === 0) {
            this.$toaster.error(this.$i18n.t('global-unexpectedError').toString());
          } else {
            this.startTime = bans.currentBans[0].startDateTime;
          }
        });
      }

      this.loading = false;
    });
  },
  methods: {
    sendNewParkingEvent() {
      this.$api.newParkingEvent({ licensePlate: this.plate })
        .then(
          // on success
          () => this.$changeRoute('Parking'),
          () => { /* on failure */ },
        );
    },
  },
});
</script>
