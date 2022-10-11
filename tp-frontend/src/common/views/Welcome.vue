<template>
  <v-container>
    <v-col>
      <v-col>
        <v-skeleton-loader
          v-if="loadingUser"
          type="text"
          style="width: 50%"
        />
        <h1 v-else>
          {{ $t("welcome-heading1") + " " + user }}
        </h1>
      </v-col>

      <v-divider />

      <FreeParkingSpaces class="ml-3" />

      <v-col>
        <v-skeleton-loader
          v-if="loadingVehicles"
          type="text"
          style="width: 40%"
        />
        <p v-else>
          {{ $tc("welcome-heading2", licensePlates.length) }}
        </p>

        <template v-if="loadingVehicles">
          <v-card
            v-for="i in 3"
            :key="i"
            class="my-3"
          >
            <v-card-text
              class="py-2"
              style="display: flex; flex-direction: row; align-content: center"
            >
              <v-skeleton-loader
                type="text"
                width="50%"
                class="text-h5 font-weight-medium my-auto mx-1"
              />
              <v-skeleton-loader
                type="button"
                class="ml-auto"
              />
            </v-card-text>
          </v-card>
        </template>

        <v-card
          v-for="plate in licensePlates"
          :key="plate"
          class="my-3"
        >
          <v-card-text
            class="py-2"
            style="display: flex; flex-direction: row; align-content: center"
          >
            <h2 class="text-h5 font-weight-medium my-auto mx-1">
              {{ plate }}
            </h2>
            <v-btn
              color="success"
              :to="{ name: 'EntryGate', query: { plate } }"
              class="ml-auto"
            >
              {{ $t("global-driveIn") }}
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col class="btn">
        <v-btn
          class="mt-5"
          color="accent"
          block
          :to="{ name: 'VehicleDetails' }"
        >
          {{ $t("welcome-driveAnother") }}
        </v-btn>
      </v-col>
    </v-col>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import FreeParkingSpaces from '../components/FreeParkingSpaces.vue';

export default Vue.extend({
  name: 'Welcome',
  components: {
    FreeParkingSpaces,
  },
  data() {
    return {
      loadingUser: true,
      loadingVehicles: true,
      user: '',
      licensePlates: [] as Array<string>,
    };
  },
  mounted() {
    this.$api.getUser().then((u) => {
      this.user = u.body.firstName;
      this.loadingUser = false;
    });

    this.$api.getRecentVehicles().then(({ body: rv }) => {
      this.licensePlates = rv.licensePlates;
      this.loadingVehicles = false;
    });
  },
});
</script>
