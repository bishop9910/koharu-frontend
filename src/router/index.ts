import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/home'
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/view/auth/LoginView.vue'),
      meta: { guestOnly: true, title: '登录' }
    },
    {
      path: '/register',
      name: 'register',
      alias: '/registe',
      component: () => import('@/view/auth/RegisterView.vue'),
      meta: { guestOnly: true, title: '注册' }
    },
    {
      path: '/home',
      component: () => import('@/view/home/HomeView.vue'),
      redirect: '/home/gallery',
      children: [
        {
          path: 'gallery',
          name: 'gallery',
          component: () => import('@/view/home/GalleryView.vue'),
          meta: { title: '图库' }
        },
        {
          path: 'albums',
          name: 'albums',
          component: () => import('@/view/home/AlbumsView.vue'),
          meta: { title: '图集' }
        },
        {
          path: 'albums/:id',
          name: 'album-detail',
          component: () => import('@/view/home/AlbumDetailView.vue'),
          meta: { title: '图集详情' }
        },
        {
          path: 'image',
          redirect: '/home/gallery'
        },
        {
          path: 'a',
          redirect: '/home/gallery'
        }
      ]
    },
    {
      path: '/profile',
      component: () => import('@/view/profile/ProfileLayout.vue'),
      redirect: '/profile/me',
      meta: { requiresAuth: true },
      children: [
        {
          path: 'me',
          name: 'profile',
          component: () => import('@/view/profile/ProfileView.vue'),
          meta: { title: '个人资料' }
        },
        {
          path: 'password',
          name: 'password',
          component: () => import('@/view/profile/PasswordView.vue'),
          meta: { title: '修改密码' }
        },
        {
          path: 'delete',
          name: 'delete-account',
          component: () => import('@/view/profile/DeleteAccountView.vue'),
          meta: { title: '删除账号' }
        },
        {
          path: 'avatar',
          name: 'avatar',
          component: () => import('@/view/profile/AvatarView.vue'),
          meta: { title: '我的头像' }
        },
        {
          path: 'submissions',
          name: 'my-submissions',
          component: () => import('@/view/profile/images/MySubmissionsView.vue'),
          meta: { title: '我的投稿' }
        },
        {
          path: 'images/approved',
          redirect: '/profile/submissions'
        },
        {
          path: 'images/pending',
          name: 'my-images-pending',
          component: () => import('@/view/profile/images/PendingImagesView.vue'),
          meta: { title: '待审核投稿' }
        },
        {
          path: 'images/rejected',
          name: 'my-images-rejected',
          component: () => import('@/view/profile/images/RejectedImagesView.vue'),
          meta: { title: '未通过投稿' }
        },
        {
          path: 'deleteUser',
          redirect: '/profile/delete'
        },
        {
          path: 'approved',
          redirect: '/profile/submissions'
        },
        {
          path: 'pending',
          redirect: '/profile/images/pending'
        },
        {
          path: 'rejected',
          redirect: '/profile/images/rejected'
        },
        {
          path: 'approvedAvators',
          redirect: '/profile/avatar'
        },
        {
          path: 'pendingAvators',
          redirect: '/profile/avatar'
        },
        {
          path: 'rejectedAvators',
          redirect: '/profile/avatar'
        }
      ]
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/home'
    }
  ]
})

export default router
