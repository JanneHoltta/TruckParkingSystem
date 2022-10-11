<template>
  <v-container>
    <v-col>
      <v-col>
        <h1>{{ $t("driveOut-body1") }}</h1>
      </v-col>

      <v-divider />

      <v-col>
        <p>{{ $t("driveOut-body2") }}</p>
      </v-col>
      <v-row class="btn">
        <v-col class="btn">
          <v-btn
            color="secondary"
            block
            @click="$changeRoute('Parking')"
          >
            {{ $t("global-cancel") }}
          </v-btn>
        </v-col>

        <v-col class="btn">
          <v-btn
            color="error"
            block
            @click="endParkingEvent"
          >
            {{ $t("driveOut-button") }}
          </v-btn>
        </v-col>
      </v-row>
    </v-col>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'DriveOut',

  mounted() {
    this.$api.getStatus().then();
  },
  methods: {
    endParkingEvent() {
      this.$api.endCurrentParkingEvent().then(
        () => this.$changeRoute('ThankYou'),
        () => { /* on failure */ },
      );
    },
  },
});
</script>
