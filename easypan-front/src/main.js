import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
// 引入elementplus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
// 图标 图标在附件中
import '@/assets/icon/iconfont.css'
import '@/assets/base.scss'
// 引入cookies
import VueCookies from 'vue-cookies'

// 自定义组件
import Dialog from '@/components/Dialog.vue'

const app = createApp(App)

app.use(ElementPlus)
app.use(router)

app.component("Dialog", Dialog)
app.mount('#app')
