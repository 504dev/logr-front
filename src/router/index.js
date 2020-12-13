import Vue from 'vue'
import Router from 'vue-router'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import DemoPage from '@/pages/DemoPage'
import LogsPage from '@/pages/LogsPage'
import LogosPage from '@/pages/LogosPage'
import CountsPage from '@/pages/CountsPage'
import JwtPage from '@/pages/JwtPage'

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
      title: 'Logr • Demo',
      component: DemoPage
    },
    {
      path: '/logos',
      name: 'logos',
      component: LogosPage
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
    }
  ]
})
