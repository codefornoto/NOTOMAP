// import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import vuetify from './vuetify'
import Vue3Lottie from 'vue3-lottie'

const app = createApp(App)

app.use(router)
app.use(vuetify)
app.use(Vue3Lottie)

app.mount('#app')
