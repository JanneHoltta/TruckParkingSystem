<template>
  <div
    class="text-h5"
    :class="{ 'text-center': centered }"
  >
    <b>
      {{ $t('global-freeParkingSpacesTitle') }}
    </b>

    <v-progress-circular
      v-if="loading"
      indeterminate
    />

    <v-chip
      v-else
      :color="statusColor"
      size="64"
      class="text-h5 ma-2"
    >
      {{ freeParkingSpaces }}
    </v-chip>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';

let interval: number | undefined;

export default Vue.extend({
  name: 'FreeParkingSpaces',
  props: {
    centered: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      loading: true,
      /** the amount of currently available parking spaces */
      freeParkingSpaces: 0,
    };
  },
  computed: {
    statusColor(): string {
      if (this.freeParkingSpaces > 10) {
        return 'success';
      }

      if (this.freeParkingSpaces > 5) {
        return 'warning';
      }

      return 'error';
    },
  },
  mounted() {
    // Update free parking spaces once per minute
    this.updateFreeParkingSpaces();
    interval = window.setInterval(this.updateFreeParkingSpaces, 60 * 1000);
  },
  beforeDestroy() {
    // Remove updater
    window.clearInterval(interval);
  },
  methods: {
    /** Updates the value of free parking spaces */
    updateFreeParkingSpaces() {
      this.$api.getFreeParkingSpaces().then((ps) => {
        this.freeParkingSpaces = ps.freeParkingSpaces;
        this.loading = false;
      });
    },
  },
});
</script>
