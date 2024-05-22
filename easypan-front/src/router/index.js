import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import("@/views/Login.vue")
    },
    {
      path: '/',
      name: 'Layout',
      component: () => import("@/views/Layout.vue")
    }
  ]
})

export default router
