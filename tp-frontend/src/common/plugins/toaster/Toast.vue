<template>
  <v-snackbar
    v-model="active"
    :timeout="timeout"
    :color="color"
    :bottom="y === 'bottom'"
    :top="y === 'top'"
    :left="x === 'left'"
    :right="x === 'right'"
    :multi-line="multiLine"
    :vertical="vertical"
    class="v-application vts"
    :class="classes"
    role="alert"
    @click="dismiss"
  >
    <div
      class="toast-message"
      :class="{ 'toast-message-padded': showClose && !closeText }"
    >
      <v-icon
        v-if="!!icon"
        dark
        left
        class="toast-icon"
        :color="iconColor"
      >
        {{ icon }}
      </v-icon>
      {{ message }}
      <slot />
    </div>

    <v-btn
      v-if="showClose"
      :icon="!closeText"
      :text="!!closeText"
      class="toast-close-btn"
      :class="{ 'toast-close-btn-icon': !closeText }"
      :color="closeColor"
      @click="close"
    >
      <v-icon v-if="!closeText">
        {{ closeIcon }}
      </v-icon>
      <span v-if="!!closeText">
        {{ closeText }}
      </span>
    </v-btn>
  </v-snackbar>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
  props: {
    x: {
      type: String,
      default: 'right',
    },
    y: {
      type: String,
      default: 'bottom',
    },
    color: {
      type: String,
      default: 'info',
    },
    icon: {
      type: String,
      default: '',
    },
    iconColor: {
      type: String,
      default: '',
    },
    classes: {
      type: [String, Object, Array],
      default: '',
    },
    message: {
      type: String,
      default: '',
    },
    timeout: {
      type: Number,
      default: 3000,
    },
    dismissable: {
      type: Boolean,
      default: true,
    },
    multiLine: {
      type: Boolean,
      default: false,
    },
    vertical: {
      type: Boolean,
      default: false,
    },
    showClose: {
      type: Boolean,
      default: false,
    },
    closeText: {
      type: String,
      default: '',
    },
    closeIcon: {
      type: String,
      default: 'close',
    },
    closeColor: {
      type: String,
      default: '',
    },
  },
  data: (): Record<string, unknown> => ({
    active: false,
  }),
  watch: {
    active(isActive: boolean, wasActive: boolean): void {
      this.$emit('statusChange', isActive, wasActive);
    },
  },
  mounted(): void {
    this.$nextTick(() => this.show());
  },
  methods: {
    show(): void {
      this.active = true;
    },
    close(): void {
      this.active = false;
    },
    dismiss(): void {
      if (this.dismissable) {
        this.close();
      }
    },
  },
});
</script>

<style>
    .vts {
        max-width: none !important;
        width: auto !important;
    }
    .vts .v-snack__content {
        justify-content: flex-start;
    }
    .toast-icon {
        margin-right: 12px;
    }
    .toast-message {
        margin-right: auto;
    }
    .toast-close-btn {
        margin: 0 -8px 0 24px !important;
        justify-self: flex-end;
    }
    .vts.v-snack--vertical .toast-icon {
        margin: 0 0 12px !important;
    }
    .vts.v-snack--vertical .v-snack__content {
        padding-bottom: 16px !important;
    }
    .vts.v-snack--vertical .toast-message-padded {
        padding: 12px 0 0;
    }
    .vts.v-snack--vertical .toast-icon + .toast-message {
        padding-top: 0;
    }
    .vts.v-snack--vertical .toast-close-btn {
        margin: 12px 0 -8px !important;
    }
    .vts.v-snack--vertical .toast-close-btn-icon {
        margin: 0 !important;
        position: absolute;
        right: 4px;
        top: 4px;
        transform: scale(1);
        padding: 4px !important;
    }
</style>
