import { ToasterOptions } from '@/common/plugins/toaster';

export default {
  x: 'center', // toast x location
  y: 'top', // toast y location
  color: 'accent', // default color for the toast
  iconColor: '',
  classes: [ // additional classes for toast (for styling etc.)
    'body-2',
  ],
  timeout: 5000,
  dismissable: true, // Is the toast closable
  multiLine: false,
  vertical: false,
  queueable: true, // Should concurrent toasts be queued and displayed one by one
  showClose: false,
  closeIcon: 'mdi-close', // Close icon
  closeColor: '', // Close icon color
  slot: [],
  theming: { // Shorthand methods are generated based on these themes
    info: {
      icon: 'mdi-information',
      color: 'info',
    },
    success: {
      icon: 'mdi-check-circle',
      color: 'success',
    },
    warning: {
      icon: 'mdi-alert',
      color: 'warning',
    },
    error: {
      icon: 'mdi-alert-octagon',
      color: 'error',
    },
  },
} as Partial<ToasterOptions>;
