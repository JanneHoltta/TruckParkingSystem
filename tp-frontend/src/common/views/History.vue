<template>
  <v-container>
    <v-col>
      <v-col>
        <h1>{{ $t("history-heading") }}</h1>
      </v-col>

      <v-divider />

      <v-col>
        <v-skeleton-loader
          v-if="loading"
          type="text"
          style="width: 40%"
        />
        <p v-else>
          {{ parkingEvents && parkingEvents.length ? $t("history-description") : $t("history-noHistory") }}
        </p>
      </v-col>

      <v-col>
        <v-expansion-panels
          multiple
        >
          <template v-if="loading">
            <v-expansion-panel
              v-for="i in 3"
              :key="i"
            >
              <v-skeleton-loader
                loading
                type="card-heading"
              />
            </v-expansion-panel>
          </template>
          <template v-else>
            <v-expansion-panel
              v-for="(parkingEvent, i) in parkingEvents"
              :key="i"
            >
              <v-expansion-panel-header
                disable-icon-rotate
              >
                <h2 class="font-weight-regular">
                  {{ dateToString(new Date(parkingEvent.startDateTime)) }}
                </h2>
                <template v-slot:actions>
                  <h2 class="font-weight-bold">
                    {{ parkingEvent.licensePlate }}
                  </h2>
                </template>
              </v-expansion-panel-header>
              <v-expansion-panel-content>
                <v-container>
                  <v-row>
                    <v-col>
                      <h3 class="font-weight-medium">
                        {{ $t("history-enter") }}:
                      </h3>
                    </v-col>
                    <v-col class="text-right">
                      <h3 class="font-weight-regular">
                        {{ dateToString(new Date(parkingEvent.startDateTime)) }}
                      </h3>
                    </v-col>
                    <v-col class="text-right">
                      <h3 class="font-weight-regular">
                        {{ timeToString(new Date(parkingEvent.startDateTime)) }}
                      </h3>
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col>
                      <h3 class="font-weight-medium">
                        {{ $t("history-exit") }}:
                      </h3>
                    </v-col>
                    <v-col class="text-right">
                      <h3 class="font-weight-regular">
                        {{ dateToString(new Date(parkingEvent.endDateTime)) }}
                      </h3>
                    </v-col>
                    <v-col class="text-right">
                      <h3 class="font-weight-regular">
                        {{ timeToString(new Date(parkingEvent.endDateTime)) }}
                      </h3>
                    </v-col>
                  </v-row>

                  <v-divider />

                  <v-row>
                    <v-col>
                      <h3 class="font-weight-medium">
                        {{ $t("history-duration") }}:
                      </h3>
                    </v-col>
                    <v-col class="text-right">
                      <h3 class="font-weight-regular">
                        {{ getDuration(parkingEvent) }}
                      </h3>
                    </v-col>
                  </v-row>
                </v-container>
              </v-expansion-panel-content>
            </v-expansion-panel>
          </template>
        </v-expansion-panels>
      </v-col>
    </v-col>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';
import { types } from '@truck-parking/tp-api';

export default Vue.extend({
  name: 'History',
  data() {
    return {
      loading: true,
      parkingEvents: [] as Array<types.ParkingEvent>,
    };
  },
  mounted() {
    this.$api.getParkingEvents().then(({ body: pe }) => {
      this.parkingEvents = pe.parkingEvents;
      this.loading = false;
    });
  },
  methods: {
    /** Return date as dd/mm/yyyy */
    dateToString(date: Date): string {
      const day = date.getDate().toString();
      const year = date.getFullYear().toString();
      const month = (date.getMonth() + 1).toString();
      return `${day}/${month}/${year}`;
    },
    /** Return time from date as hh/mm */
    timeToString(time: Date): string {
      const hours = time.getHours().toString();
      const mins = time.getMinutes().toString();
      return `${(`0${hours}`).slice(-2)}:${(`0${mins}`).slice(-2)}`;
    },
    /** return duration in format "1 h 59 min" */
    getDuration(parkingEvent: types.ParkingEvent): string {
      const start = new Date(parkingEvent.startDateTime);
      const end = new Date(parkingEvent.endDateTime);
      const diff = Math.floor((end.getTime() - start.getTime()) / 1000 / 60);
      const hours = Math.floor(diff / 60);
      const mins = diff % 60;
      return `${hours} h ${mins} min`;
    },
  },
});
</script>
