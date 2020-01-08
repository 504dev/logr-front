import Vue from 'vue'
import Router from 'vue-router'
import LoginPage from '@/components/LoginPage'
import DashboardPage from '@/components/DashboardPage'
import LogsPage from '@/components/LogsPage'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      redirect: '/dashboards'
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
      path: '/login',
      name: 'login',
      component: LoginPage
    }
  ]
})
