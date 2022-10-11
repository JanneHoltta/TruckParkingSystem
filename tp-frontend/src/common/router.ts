import VueRouter from 'vue-router';

interface RouterParams {
  isLoggedIn(): boolean
}

export type RouterConstructor = (params: RouterParams) => VueRouter
