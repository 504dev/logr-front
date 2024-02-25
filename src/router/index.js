import Vue from 'vue'
import Router from 'vue-router'
import { DEMO, DASHBOARDS, LOGS, COUNTS, LOGIN, JWT, POLICY, SUPPORT } from '@/constants/pages'
const LoginPage = () => import('@/pages/LoginPage.vue')
const DashboardPage = () => import('@/pages/DashboardPage.vue')
const DemoPage = () => import('@/pages/DemoPage.vue')
const PolicyPage = () => import('@/pages/PolicyPage.vue')
const SupportPage = () => import('@/pages/SupportPage.vue')
const LogsPage = () => import('@/pages/LogsPage.vue')
const CountsPage = () => import('@/pages/CountsPage.vue')
const JwtPage = () => import('@/pages/JwtPage.vue')


Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      redirect: '/dashboards'
    },
    {
      path: '/demo',
      name: DEMO,
      component: DemoPage
    },
    {
      path: '/policy',
      name: POLICY,
      component: PolicyPage
    },
    {
      path: '/support',
      name: SUPPORT,
      component: SupportPage
    },
    {
      path: '/dashboards',
      name: DASHBOARDS,
      component: DashboardPage
    },
    {
      path: '/dashboard/:id/logs',
      name: LOGS,
      component: LogsPage
    },
    {
      path: '/dashboard/:id/counts',
      name: COUNTS,
      component: CountsPage
    },
    {
      path: '/login',
      name: LOGIN,
      component: LoginPage
    },
    {
      path: '/jwt/:token',
      name: JWT,
      component: JwtPage
    },
  ]
})
