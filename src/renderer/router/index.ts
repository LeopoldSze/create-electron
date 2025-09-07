import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/main/chat' },
  {
    path: '/main',
    component: () => import('../window/main.vue'),
    children: [
      { path: 'chat', component: () => import('../window/main/chat.vue') },
      { path: 'contact', component: () => import('../window/main/contact.vue') },
      { path: 'collection', component: () => import('../window/main/collection.vue') }
    ]
  },
  {
    path: '/setting',
    component: () => import('../window/setting.vue'),
    children: [{ path: 'account', component: () => import('../window/setting/accountSetting.vue') }]
  },
  {
    path: '/userInfo',
    component: () => import('../window/userInfo.vue')
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
