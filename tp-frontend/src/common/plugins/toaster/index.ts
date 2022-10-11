import Vue, { PluginFunction, VNode } from 'vue';
import Toast from './Toast.vue';

// Type definition for the internal structure of Vue instance
type CombinedVueInstance<Instance extends Vue, Data, Methods, Computed, Props> =
  Data & Methods & Computed & Props & Instance;

type ThemedShorts = 'info' | 'success' | 'warning' | 'error'

/** Type wrapping for a Toast component properties */
export interface ToastObject {
    x?: string
    y?: string
    color?: string
    icon?: string
    iconColor?: string
    classes?: string | Record<string, string> | Array<Record<string, string> | string>
    timeout?: number
    dismissable?: boolean
    multiLine?: boolean
    vertical?: boolean
    showClose?: boolean
    closeText?: string
    closeIcon?: string
    closeColor?: string
    queueable?: boolean
    slot?: VNode[]
}

type ThemedMethods = Record<ThemedShorts, (message: string, options?: ToastObject) => void>

export type ToasterOptions = ToastObject & {
    theming?: Record<ThemedShorts, ToastObject>
}

interface Toaster {
    (message: string, options?: ToastObject): void
}

type BufferedToast = { message: string, options: ToastObject }

type ToasterComponent = CombinedVueInstance<
  Vue,
  Record<string, unknown>,
  {close: () => void},
  Record<string, unknown>,
  Record<never, unknown>
>

export type ToasterMethods = Toaster & ThemedMethods & {
  getCmp: () => ToasterComponent | null
  clearQueue: () => void
}

/** Properties for new Toasts */
let propertyObject: ToasterMethods & { globalOptions: ToasterOptions };

const init: PluginFunction<ToasterOptions> = (vueConstructor, globalOptions: ToasterOptions = {}) => {
  /** Global context for an existing visible Toast */
  let cmp: null | ToasterComponent = null;
  const queue: BufferedToast[] = [];

  /** Creates a new Toast component */
  function createCmp(options: ToastObject & { message: string }) {
    const component = new Vue(Toast);
    const componentOptions = { ...propertyObject.globalOptions, ...options };

    if (componentOptions.slot) {
      component.$slots.default = componentOptions.slot;
      delete componentOptions.slot;
    }

    Object.assign(component, componentOptions);
    document.body.appendChild(component.$mount().$el);

    return component as ToasterComponent;
  }

  /** Creates and shows a new Toast */
  function show(message: string, options: ToastObject = {}) {
    if (cmp) {
      const isQueueable = options.queueable !== undefined ? options.queueable : globalOptions.queueable;

      if (isQueueable) {
        queue.push({ message, options });
      } else {
        cmp.close();
        queue.unshift({ message, options });
      }

      return;
    }

    cmp = createCmp({ message, ...options });
    cmp.$on('statusChange', (isActive: boolean, wasActive: boolean) => {
      if (wasActive && !isActive) {
        if (cmp) {
          cmp.$nextTick(() => {
            if (cmp) {
              cmp.$destroy();
              cmp = null;

              if (queue.length) {
                const toast = queue.shift() as BufferedToast;
                show(toast.message, toast.options);
              }
            }
          });
        }
      }
    });
  }

  /** Creates shorthand methods for themed toasts */
  function shorts(options: ToasterOptions): ThemedMethods {
    const methods: Partial<ThemedMethods> = {};

    if (options.theming) {
      Object.entries(options.theming).forEach(([key, localOptions]) => {
        methods[key as keyof ThemedMethods] = (message: string, opts?: ToastObject) => show(
          message,
          { ...localOptions, ...opts },
        );
      });
    }

    return methods as ThemedMethods;
  }

  /** Returns the currently visible Toast component or null */
  function getCmp(): ToasterComponent | null {
    return cmp;
  }

  /**
   * Returns removed toasts
   */
  function clearQueue(): BufferedToast[] {
    return queue.splice(0, queue.length);
  }

  propertyObject = Object.assign(show, {
    globalOptions,
    getCmp,
    clearQueue,
    ...shorts(globalOptions),
  });

  // eslint-disable-next-line no-param-reassign
  vueConstructor.prototype.$toaster = propertyObject as ToasterMethods;
};

if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(init);
}

export default init;

/**
 * Small wrapper to provide an easy way of using toaster in setup with vue-composition-api
 */
export function useToaster(): ToasterMethods {
  return propertyObject;
}

declare module 'vue/types/vue' {
  // eslint-disable-next-line no-shadow
    interface Vue {
        $toaster: ToasterMethods
    }
}
