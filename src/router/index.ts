import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: '主页',
      path: '/',
      component: () => import('@/view/HomeView.vue')
    },
    {
      name: '我的',
      path: '/profile',
      component: () => import('@/view/UserView.vue')
    },
    {
      name: '登录',
      path: '/login',
      component: () => import('@/view/LoginView.vue')
    },
    {
      name: '注册',
      path: '/registe',
      component: () => import('@/view/RegisteView.vue')
    }


  ]
})

export default router
