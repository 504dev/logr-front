import Vue from 'vue'
import Router from 'vue-router'
const LoginPage = () => import('@/pages/LoginPage.vue')
const DashboardPage = () => import('@/pages/DashboardPage.vue')
const DemoPage = () => import('@/pages/DemoPage.vue')
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
      name: 'demo',
      component: DemoPage
    },
    {
      path: '/dashboards',
      name: 'dashboards',
      component: DashboardPage
    },
    {
      path: '/dashboard/:id/logs',
      name: 'dashboard-logs',
      component: LogsPage
    },
    {
      path: '/dashboard/:id/counts',
      name: 'dashboard-counts',
      component: CountsPage
    },
    {
      path: '/login',
      name: 'login',
      component: LoginPage
    },
    {
      path: '/jwt/:token',
      name: 'jwt',
      component: JwtPage
    },
  ]
})
