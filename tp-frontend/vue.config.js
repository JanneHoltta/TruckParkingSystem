// eslint-disable-next-line @typescript-eslint/no-var-requires
const webpack = require('webpack');

module.exports = {
  css: {
    loaderOptions: {
      scss: {
        additionalData: '@import "/src/rekkaparkki/variables.scss";',
      },
    },
  },

  lintOnSave: false,

  pages: {
    index: {
      entry: `src/${process.env.APP}/main.ts`,
    },
  },

  transpileDependencies: [
    'vuetify',
  ],

  pluginOptions: {
    i18n: {
      locale: 'fi',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false,
      enableBridge: false,
    },
  },

  devServer: {
    proxy: {
      '/api': {
        target: 'https://frontend.remote-dev.yobitti.fi/',
      },
    },
    https: true,
  },

  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        'process.env.BUILD_YEAR': (new Date().getFullYear()),
      }),
    ],
  },
};
