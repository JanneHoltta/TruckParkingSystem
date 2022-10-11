<template>
  <div class="text-center">
    <v-progress-circular
      :indeterminate="loading"
      :rotate="loading ? 0 : -90"
      :size="300"
      :width="45"
      :value="elapsedPercentage"
      :color="loading ? 'grey' : progressColor"
      class="parking-progress"
    >
      {{ /^0 (s|min|h)$/.test(timeRemaining) && expiredText ? expiredText : timeRemaining }}
    </v-progress-circular>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Precision, secondsToPrettyString } from '@/common/utils/time';
import moment from 'moment';

let interval: number | undefined;

export default Vue.extend({
  name: 'Timer',

  props: {
    /** ISO8601 timestamp of the start time */
    startDateTime: {
      type: String,
      required: false,
      default: null,
    },
    /** ISO8601 timestamp of the expiry time */
    expiryDateTime: {
      type: String,
      required: false,
      default: null,
    },
    /** default color for the timer */
    color: {
      type: String,
      default: 'primary',
    },
    /** color for the timer after expiration */
    expiredColor: {
      type: String,
      default: 'error',
    },
    /** text for the timer after expiration */
    expiredText: {
      type: String,
      default: '',
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      /** elapsed parking time in seconds since startDateTime */
      elapsedTime: 0,
    };
  },
  computed: {
    /** maximum parking time in seconds since startDateTime */
    maxParkingTime(): number {
      return moment(this.expiryDateTime).diff(moment(this.startDateTime), 'seconds');
    },
    /** calculates the elapsed percentage (example: 15% -> 15) */
    elapsedPercentage(): number {
      return Math.max(Math.min(100, (this.elapsedTime / this.maxParkingTime) * 100), 0);
    },
    /** remaining time as a formatted timestamp */
    timeRemaining(): string {
      // Calculate remaining time in seconds
      const rem = Math.max(0, Math.floor(this.maxParkingTime - this.elapsedTime));

      // eslint-disable-next-line no-restricted-globals
      return isNaN(rem) ? '' : secondsToPrettyString(rem, Precision.Seconds);
    },
    /** dynamic color for the progress bar and the text inside it */
    progressColor(): string {
      return (this.elapsedPercentage >= 100) ? this.expiredColor : this.color;
    },
  },
  watch: {
    startDateTime() {
      this.updateElapsed();
    },
    expiryDateTime() {
      this.updateElapsed();
    },
  },
  mounted() {
    // Update elapsed time once per second
    this.updateElapsed();
    interval = window.setInterval(this.updateElapsed, 1000);
  },
  beforeDestroy() {
    // Remove updater
    window.clearInterval(interval);
  },
  methods: {
    /** Updates the value of elapsedTime */
    updateElapsed(): void {
      // Emit expired event when the timer hits zero
      // (but only when both startDateTime and expiryDateTime are given)
      if (this.startDateTime && this.expiryDateTime && this.maxParkingTime <= this.elapsedTime) {
        this.$emit('expired');
      }

      this.elapsedTime = moment().diff(moment(this.startDateTime), 'seconds');
    },
  },
});
</script>

<style lang="scss">
  // The following styles cannot be scoped:
  .parking-progress {
    .v-progress-circular__info {
      font-weight: bold;
      font-size: 1.5rem;
    }
  }

  // Slower spinning animation as the spinner is larger
  .parking-progress.v-progress-circular--indeterminate {
    .v-progress-circular__overlay {
      animation: progress-circular-dash 3.5s ease-in-out infinite !important;
    }

    svg {
      animation: progress-circular-rotate 4s linear infinite;
    }
  }
</style>
