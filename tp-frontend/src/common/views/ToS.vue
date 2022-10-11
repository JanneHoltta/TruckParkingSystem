<template>
  <v-container>
    <v-col>
      <v-col>
        <h1>{{ $t("ToS-heading") }}</h1>
      </v-col>

      <v-divider />

      <v-col>
        <p>{{ $t("ToS-termsOfService") }}</p>
      </v-col>
    </v-col>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  name: 'ToS',
});
</script>
