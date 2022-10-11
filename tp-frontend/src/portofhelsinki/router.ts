import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';
import { RouterConstructor } from '@/common/router';

const initRouter: RouterConstructor = (params) => {
  Vue.use(VueRouter);

  const routes: Array<RouteConfig> = [
    {
      path: '/',
      name: 'Home',
      // Route level code-splitting:
      // This generates a separate chunk (home.[hash].js) for this route,
      // which is lazy-loaded when the route is visited.
      component: () => import(/* webpackChunkName: "home" */ '../common/views/Home.vue'),
    },
    {
      path: '/login',
      name: 'LogIn',
      beforeEnter(to, from, next) {
        if (!params.isLoggedIn()) {
          // User is not logged in; continue to login view
          next();
        } else if (to.query?.redirect && typeof to.query?.redirect === 'string') {
          // User is logged in and redirect query param exists; redirect accordingly
          next({ name: to.query.redirect });
        } else {
          // User is logged in and there is no redirect query param; redirect to welcome
          next({ name: 'Welcome' });
        }
      },
      props: (route: { query: Record<string, string> }) => ({ redirect: route.query?.redirect }),
      component: () => import(/* webpackChunkName: "login" */ '../common/views/LogIn.vue'),
    },
    {
      path: '/signup',
      name: 'SignUp',
      beforeEnter(to, from, next) {
        if (params.isLoggedIn()) {
          next({ name: 'Welcome' });
        } else {
          next();
        }
      },
      component: () => import(/* webpackChunkName: "signup" */ '../common/views/SignUp.vue'),
    },
    {
      path: '/welcome',
      name: 'Welcome',
      meta: {
        loginRequired: true,
      },
      component: () => import(/* webpackChunkName: "welcome" */ '../common/views/Welcome.vue'),
    },
    {
      path: '/history',
      name: 'History',
      meta: {
        loginRequired: true,
      },
      component: () => import(/* webpackChunkName: "history" */ '../common/views/History.vue'),
    },
    {
      path: '/account',
      name: 'Account',
      component: () => import(/* webpackChunkName: "account" */ '../common/views/Account.vue'),
    },
    {
      path: '/vehicleDetails',
      name: 'VehicleDetails',
      meta: {
        loginRequired: true,
      },
      component: () => import(/* webpackChunkName: "vehicle-details" */ '../common/views/VehicleDetails.vue'),
    },
    {
      path: '/entryGate',
      name: 'EntryGate',
      meta: {
        loginRequired: true,
      },
      props: (route: { query: Record<string, string> }) => ({ plate: route.query?.plate }),
      component: () => import(/* webpackChunkName: "entry-gate" */ '../common/views/EntryGate.vue'),
    },
    {
      path: '/parking',
      name: 'Parking',
      meta: {
        loginRequired: true,
      },
      component: () => import(/* webpackChunkName: "parking" */ '../common/views/Parking.vue'),
    },
    {
      path: '/driveOut',
      name: 'DriveOut',
      meta: {
        loginRequired: true,
      },
      component: () => import(/* webpackChunkName: "drive-out" */ '../common/views/DriveOut.vue'),
    },
    {
      path: '/thankYou',
      name: 'ThankYou',
      meta: {
        loginRequired: true,
      },
      component: () => import(/* webpackChunkName: "thank-you" */ '../common/views/ThankYou.vue'),
    },
    {
      path: '/privacy',
      name: 'Privacy',
      component: () => import(/* webpackChunkName: "privacy" */ '../common/views/Privacy.vue'),
    },
    {
      path: '/tos',
      name: 'ToS',
      component: () => import(/* webpackChunkName: "tos" */ '../common/views/ToS.vue'),
    },
    {
      path: '/accessibility',
      name: 'Accessibility',
      component: () => import(/* webpackChunkName: "accessibility" */ '../common/views/Accessibility.vue'),
    },
    {
      path: '/help',
      name: 'Instructions',
      component: () => import(/* webpackChunkName: "instructions" */ '../common/views/Instructions.vue'),
    },
    {
      path: '/forgotPassword',
      name: 'ForgotPassword',
      component: () => import(/* webpackChunkName: "forgot-password" */ '../common/views/ForgotPassword.vue'),
    },
  ];

  const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes,
  });

  router.beforeEach((to, from, next) => {
    // Redirect to LogIn when trying to access route which requires login.
    // Login is considered as required if route metadata contains field loginRequired and its
    // value is truthy. After logged in, the user will be redirected to the original destination.
    if (to.meta && to.meta.loginRequired) {
      // Requires login
      if (!params.isLoggedIn()) {
        console.warn('Not logged in, redirecting to home');
        next({ name: 'LogIn', query: { redirect: to.name } });
      } else {
        next();
      }
    } else {
      // Login not required
      next();
    }
  });

  return router;
};

export default initRouter;
