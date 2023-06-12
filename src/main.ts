import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedState from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'
import timeago from 'vue-timeago3'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import { useTalksStore } from './stores/talks'

const pinia = createPinia()
pinia.use(piniaPluginPersistedState)

const app = createApp(App)
  .use(pinia)
  .use(router)
  .use(timeago)

// load talk data
useTalksStore().fill()
  .then(() => app.mount('#app'))
