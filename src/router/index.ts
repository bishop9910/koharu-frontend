import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      name: '主页',
      path: '/home',
      component: () => import('@/view/HomeView.vue'),
      redirect: '/home/image',
      children: [
        {
          name: '图库',
          path: 'image',
          component: () => import('@/view/image.vue')
        },
        {
          name: 'a',
          path: 'a',
          component: () => import('@/view/a.vue')
        },
        {
          name: '图集',
          path: 'albums',
          component: () => import('@/view/albums.vue')
        }
      ]
    },
    {
      name: '我的',
      path: '/profile',
      component: () => import('@/view/UserView.vue'),
      redirect: '/profile/me',
      children: [
        {
          name: '资料',
          path: 'me',
          component: () => import('@/view/me.vue')
        },
        {
          name: '密码',
          path: 'password',
          component: () => import('@/view/password.vue')
        },
        {
          name: '删除账号',
          path: 'deleteUser',
          component: () => import('@/view/deleteUser.vue')
        },
        {
          name: 'approved',
          path: 'approved',
          component: () => import('@/view/approved.vue')
        },
        {
          name: 'pending',
          path: 'pending',
          component: () => import('@/view/pending.vue')
        },
        {
          name: 'rejected',
          path: 'rejected',
          component: () => import('@/view/rejected.vue')
        },
        {
          name: 'approvedAvators',
          path: 'approvedAvators',
          component: () => import('@/view/approvedAvators.vue')
        },
        {
          name: 'pendingAvators',
          path: 'pendingAvators',
          component: () => import('@/view/pendingAvators.vue')
        },
        {
          name: 'rejectedAvators',
          path: 'rejectedAvators',
          component: () => import('@/view/rejectedAvators.vue')
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
