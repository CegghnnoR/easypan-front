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

import Verify from '@/utils/Verify'
import Message from './utils/Message'
import Request from './utils/Request'

// 自定义组件
import Dialog from '@/components/Dialog.vue'
import Avatar from '@/components/Avatar.vue'

const app = createApp(App)

app.use(ElementPlus)
app.use(router)

app.component("Dialog", Dialog)
app.component("Avatar", Avatar)

// 配置全局组件
app.config.globalProperties.Verify = Verify
app.config.globalProperties.Message = Message
app.config.globalProperties.Request = Request
app.config.globalProperties.VueCookies = VueCookies
app.config.globalProperties.globalInfo = {
  avatarUrl:"/api/getAvatar/"
}
app.mount('#app')
