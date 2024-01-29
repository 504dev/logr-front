import Vue from 'vue'
import Router from 'vue-router'
import LoginPage from '@/pages/LoginPage.vue'
import DashboardPage from '@/pages/DashboardPage.vue'
import DemoPage from '@/pages/DemoPage.vue'
import LogsPage from '@/pages/LogsPage.vue'
import CountsPage from '@/pages/CountsPage.vue'
import JwtPage from '@/pages/JwtPage.vue'

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
