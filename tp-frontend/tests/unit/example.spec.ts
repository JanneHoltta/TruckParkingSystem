import { mount } from '@vue/test-utils';
import { types } from '@truck-parking/tp-api';
import App from '@/common/App.vue';

describe('App', () => {
  const wrapper = mount(App, {
    mocks: {
      // Mock i18n translate function
      $t: (a: string) => a,
      $vuetify: {
        theme: { dark: true },
      },
      $api: {
        // Mock free parking spaces API request
        async getFreeParkingSpaces() {
          return { freeParkingSpaces: 10 } as types.FreeParkingSpaces;
        },
      },
    },
    propsData: {
      // eslint-disable-next-line global-require
      headerImg: () => require('../../src/rekkaparkki/assets/rekkaparkki_white.png'),
      // eslint-disable-next-line global-require
      logoImg: () => require('../../src/rekkaparkki/assets/rekkaparkki_transparent.png'),
      title: 'Rekkaparkki',
    },
  });

  it('should have a wrapper', () => {
    expect(wrapper.exists()).toBe(true);
  });

  afterAll(() => {
    wrapper.destroy();
  });
});
