import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/main/chat' },
  {
    path: '/main',
    component: () => import('@/renderer/window/main/main.vue'),
    children: [
      { path: 'chat', component: () => import('@/renderer/window/main/chat/chat.vue') },
      { path: 'contact', component: () => import('@/renderer/window/main/contact/contact.vue') },
      {
        path: 'collection',
        component: () => import('@/renderer/window/main/collection/collection.vue')
      }
    ]
  },
  {
    path: '/setting',
    component: () => import('@/renderer/window/setting/setting.vue'),
    children: [
      { path: 'account', component: () => import('@/renderer/window/setting/accountSetting.vue') }
    ]
  },
  {
    path: '/userInfo',
    component: () => import('@/renderer/window/userInfo.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
