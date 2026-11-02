import type { Router } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const APP_NAME = 'Koharu'

export function setupRouterGuards(router: Router) {
  router.beforeEach((to) => {
    const auth = useAuthStore()

    if (to.meta.requiresAuth && !auth.isAuthenticated) {
      return {
        name: 'login',
        query: { redirect: to.fullPath }
      }
    }

    if (to.meta.guestOnly && auth.isAuthenticated) {
      return { name: 'gallery' }
    }
  })

  router.afterEach((to) => {
    const title = to.meta.title
    document.title = title ? `${title} · ${APP_NAME}` : APP_NAME
  })
}
