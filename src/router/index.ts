import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: '主页',
      path: '/home',
      component: () => import('@/view/HomeView.vue'),
      redirect: '/home/a',
      children: [
        {
          name: 'a',
          path: 'a',
          component: () => import('@/view/a.vue')
        },
        {
          name: 'b',
          path: 'b',
          component: () => import('@/view/b.vue')
        },
        {
          name: 'c',
          path: 'c',
          component: () => import('@/view/c.vue')
        }
      ]
    },
    {
      name: '我的',
      path: '/profile',
      component: () => import('@/view/UserView.vue'),
      redirect: '/profile/au',
      children: [
        {
          name: 'au',
          path: 'au',
          component: () => import('@/view/au.vue')
        },
        {
          name: 'bu',
          path: 'bu',
          component: () => import('@/view/bu.vue')
        },
        {
          name: 'cu',
          path: 'cu',
          component: () => import('@/view/cu.vue')
        }
      ]
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
    },
    {
      redirect: '/login',
      path: '/'
    }


  ]
})

export default router
