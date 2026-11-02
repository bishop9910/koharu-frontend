import { createApp } from 'vue'
import { createPinia } from 'pinia'
import {
  NAlert,
  NButton,
  NCheckbox,
  NDialogProvider,
  NDropdown,
  NEmpty,
  NForm,
  NFormItem,
  NImage,
  NImageGroup,
  NInput,
  NMenu,
  NMessageProvider,
  NModal,
  NSkeleton,
  NSpin,
  NTag,
  NTooltip,
  NUpload
} from 'naive-ui'

import App from './App.vue'
import router from './router'
import { setupRouterGuards } from './router/guards'
import { setAuthFailedHandler, setTokenProvider } from './utils/request'
import { piniaTokenProvider } from './utils/token-provider'
import { useUserStore } from './stores/user'
import './style.css'

const app = createApp(App)

const naiveComponents = {
  NAlert,
  NButton,
  NCheckbox,
  NDialogProvider,
  NDropdown,
  NEmpty,
  NForm,
  NFormItem,
  NImage,
  NImageGroup,
  NInput,
  NMenu,
  NMessageProvider,
  NModal,
  NSkeleton,
  NSpin,
  NTag,
  NTooltip,
  NUpload
}

for (const [name, component] of Object.entries(naiveComponents)) {
  app.component(name, component)
}

app.use(createPinia())

setupRouterGuards(router)
app.use(router)

setTokenProvider(piniaTokenProvider)

setAuthFailedHandler(() => {
  useUserStore().logout()

  const redirect = router.currentRoute.value.fullPath
  if (router.currentRoute.value.name !== 'login') {
    router.replace({
      name: 'login',
      query: { redirect }
    })
  }
})

app.mount('#app')
