import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import naive from 'naive-ui'
import "./style.css"
import { setAuthFailedHandler, setTokenProvider } from './utils/request.ts'

import { piniaTokenProvider } from './utils/token-provider.ts'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(naive)
setTokenProvider(piniaTokenProvider);

setAuthFailedHandler(() => {
  piniaTokenProvider.clear();
  router.push('/login');
});

app.mount('#app')
