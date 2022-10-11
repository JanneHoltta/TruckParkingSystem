<template>
  <v-container>
    <v-col>
      <v-col>
        <v-skeleton-loader
          v-if="loading"
          loading
          type="heading"
          max-width="100%"
        />
        <h1 v-else>
          {{ $t("parking-parking") }} {{ (parkingEvent != null) ? parkingEvent.licensePlate : '' }}
        </h1>
      </v-col>

      <v-divider />

      <v-col class="text-center">
        <v-skeleton-loader
          v-if="loading"
          loading
          type="text"
          style="width: 40%"
          class="mx-auto"
        />
        <h2 v-else>
          {{ $t("parking-timeRemaining") }}
        </h2>
      </v-col>

      <v-col>
        <timer
          color="accent"
          expired-color="error"
          :loading="loading"
          :start-date-time="startDate"
          :expiry-date-time="expiryDate"
          :expired-text="$t('parking-timeUp')"
        />
      </v-col>

      <v-col class="btn">
        <v-btn
          class="mt-5"
          color="error"
          block
          @click="driveOut"
        >
          {{ $t("parking-driveOutNow") }}
        </v-btn>
      </v-col>
    </v-col>
  </v-container>
</template>

<script lang="ts">
import { types } from '@truck-parking/tp-api';
import Vue from 'vue';
import Timer from '../components/Timer.vue';

export default Vue.extend({
  name: 'ParkingVue',
  components: { Timer },
  data() {
    return {
      loading: true,
      /** Current parking event or null (null initially & when there is no current parking event) */
      parkingEvent: null as types.ParkingEvent | null,
    };
  },
  computed: {
    startDate(): string | null {
      return this.parkingEvent ? this.parkingEvent.startDateTime : null;
    },
    expiryDate(): string | null {
      return this.parkingEvent ? this.parkingEvent.expiryDateTime : null;
    },
  },
  mounted() {
    this.fetchData();
  },
  methods: {
    /** Fetches the required data from the backend */
    fetchData(): void { // Fetch data from backend
      this.$api.getCurrentParkingEvent().then(({ body: event }) => {
        if (event === null) {
          // No current parking event – Redirect to welcome
          this.$toaster.warning(this.$i18n.t('parking-noEvent').toString());
          this.$replaceRoute('Welcome');
        }

        this.parkingEvent = event;
        this.loading = false;
      });
    },
    /** Called when `drive out now` button has been pressed */
    driveOut(): void {
      this.$changeRoute('DriveOut');
    },
  },
});
</script>
