<template>
  <v-container>
    <v-col>
      <v-col>
        <h1>{{ $t("accessibility-heading") }}</h1>
      </v-col>

      <v-divider />

      <v-col>
        <p>{{ $t("accessibility-content") }}</p>
      </v-col>
    </v-col>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'Accessibility',
});
</script>
