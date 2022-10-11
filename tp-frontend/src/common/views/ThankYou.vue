<template>
  <v-container>
    <v-col>
      <v-col>
        <h1>{{ $t("thankYou-forYourVisit") }}</h1>
      </v-col>

      <v-divider />

      <v-col class="text-center">
        <p>
          {{ $t("thankYou-parkAgain") }}
        </p>
      </v-col>

      <v-col>
        <timer
          :loading="loading"
          color="accent"
          expired-color="success"
          :start-date-time="startTime"
          :expiry-date-time="parkingAllowedAt"
          @expired="canParkAgain = true"
        />
      </v-col>

      <v-col class="btn">
        <v-btn
          v-if="canParkAgain"
          color="success"
          block
          @click="$changeRoute('Welcome')"
        >
          {{ $t('thankYou-toParking') }}
        </v-btn>
      </v-col>
    </v-col>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import { enums } from '@truck-parking/tp-api';
import Timer from '../components/Timer.vue';

export default Vue.extend({
  name: 'ParkingVue',
  components: { Timer },
  data() {
    return {
      loading: true,
      canParkAgain: false,
      parkingAllowedAt: null as string | null,
      startTime: null as string | null,
    };
  },
  mounted() {
    this.$api.getStatus().then(({ userStatus }) => {
      this.parkingAllowedAt = userStatus.nextParkingAllowed;
      if (userStatus.status === enums.UserStatus.Cooldown) {
        this.$api.getParkingEvents().then(({ body: pe }) => {
          this.startTime = pe.parkingEvents[0].endDateTime;
        });
      }

      this.loading = false;
    });
  },
  methods: {
    sendLogOut(): void {
      this.$logOut();
      this.$changeRoute('Home');
    },
  },
});
</script>
