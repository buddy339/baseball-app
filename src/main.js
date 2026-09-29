import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import Vant from 'vant' // 1. 引入 Vant 组件库
import 'vant/lib/index.css'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(Vant) // 2. 全局注册 Vant 组件（关键！让所有页面都能用）
app.mount('#app')