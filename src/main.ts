import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import "./style.css"
import { setAuthFailedHandler, setTokenProvider } from './utils/request.ts'
import { piniaTokenProvider } from './utils/token-provider.ts'

setTokenProvider(piniaTokenProvider);

setAuthFailedHandler(() => {
  piniaTokenProvider.clear();
  router.push('/login');
});

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
