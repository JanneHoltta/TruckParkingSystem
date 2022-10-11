import Vue from 'vue';
import Vuetify, {
  VSnackbar, VBtn, VIcon,
} from 'vuetify/lib';
import { UserVuetifyPreset } from 'vuetify';
import Toaster, { ToasterMethods, ToasterOptions, useToaster } from './toaster';

export interface InitializedVuetify {
  vuetify: Vuetify,
  toaster: ToasterMethods,
}

/**
 * Initializes Vuetify and related plugins
 *
 * @param vuetifyPreset provide custom Vuetify preset for custom theming
 * @param toasterOptions provide options for toaster customization
 */
export const initVuetify = (
  vuetifyPreset: Partial<UserVuetifyPreset>,
  toasterOptions: Partial<ToasterOptions>,
): InitializedVuetify => {
  Vue.use(Vuetify, {
    components: {
      // Always register components used by Toaster.vue as the tree-shaking library can't observe Toaster.vue directly
      VSnackbar,
      VBtn,
      VIcon,
    },
  });

  const vuetify = new Vuetify(vuetifyPreset);

  // Register toaster plugin
  Vue.use(Toaster, {
    ...toasterOptions,
    $vuetify: vuetify.framework, // Supply the vuetify framework instance to the Toaster
  });

  return {
    vuetify,
    get toaster() { return useToaster(); },
  };
};
