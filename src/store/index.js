import _ from 'lodash'
import axios from 'axios'
import ls from 'store2'
import Vue from 'vue'
import Vuex from 'vuex'
import jwtDecode from 'jwt-decode'
import Sock from '../libs/sock'
import router from '../router'
import ACTIONS from './action-types.js'
import MUTATIONS from './mutations-types.js'

Vue.use(Vuex)

console.log(process.env)

const store = new Vuex.Store({
  state: {
    user: null,
    dashboards: null,
    shared: null,
    jwt: localStorage.getItem('jwt'),
    sock: null,
    mode: ls.get('mode', 0),
    orient: ls.get('orient', 0),
    fullscreen: 0,
    version: null,
    org: null
  },
  getters: {
    restUrl() {
      return process.env.VUE_APP_REST || location.origin
    },
    wsUrl(state, getters) {
      return getters.restUrl.replace(/^http/, 'ws').replace(/\/?$/, '/ws')
    },
    dashgroups(state) {
      const own = []
      const shared = []
      if (state.dashboards) {
        state.dashboards.forEach(dash => {
          if (dash.owner_id === state.user.id) {
            own.push(dash)
          } else {
            shared.push(dash)
          }
        })
      }
      return { own, shared }
    },
    jwtPayload(state) {
      if (!state.jwt) {
        return null
      }
      try {
        return jwtDecode(state.jwt)
      } catch (e) {
        console.error(e)
        return null
      }
    },
    isExpired(state, getters) {
      return getters.jwtPayload ? getters.jwtPayload.exp * 1000 < Date.now() : true
    },
    api: (state, getters) => (path, options = {}) => {
      if (getters.isExpired) {
        location.href = '/login'
      }
      return axios({
        method: 'GET',
        url: getters.restUrl + '/api' + path,
        headers: { Authorization: `Bearer ${state.jwt}` },
        ...options
      })
    }
  },
  mutations: {
    [MUTATIONS.SET_JWT]: (state, token) => {
      localStorage.setItem('jwt', token)
      state.jwt = token
    },
    [MUTATIONS.UNSET_JWT]: (state, token) => {
      localStorage.removeItem('jwt', token)
      state.jwt = null
    },
    [MUTATIONS.SWITCH_MODE]: state => {
      state.mode = 1 - state.mode
      ls.set('mode', state.mode)
    },
    [MUTATIONS.SWITCH_ORIENT]: state => {
      state.orient = 1 - state.orient
      ls.set('orient', state.orient)
      Vue.nextTick(() => {
        window.dispatchEvent(new Event('resize'))
      })
    },
    [MUTATIONS.SWITCH_FULL]: state => {
      state.fullscreen = 1 - state.fullscreen
      Vue.nextTick(() => {
        window.dispatchEvent(new Event('resize'))
      })
    }
  },
  actions: {
    [ACTIONS.LOGOUT]() {
      localStorage.removeItem('jwt')
      location.href = '/login'
    },
    async [ACTIONS.WS_CONNECT]({ state, getters }) {
      if (!state.sock) {
        state.sock = new Sock(getters.wsUrl, state.jwt)
        const event = await state.sock.connect()
        console.log('ws connected', event)
      }
      return this.sock
    },
    async [ACTIONS.LOAD_DASHBOARDS]({ state, getters }) {
      const { data } = await getters.api('/me/dashboards')
      state.dashboards = data
    },
    async [ACTIONS.LOAD_SHARED]({ state, getters }) {
      const { data } = await getters.api('/me/dashboards/shared')
      state.shared = data
    },
    async [ACTIONS.ADD_DASHBOARD]({ state, getters }, name) {
      const { data } = await getters.api('/me/dashboard', {
        method: 'POST',
        data: { name }
      })
      state.dashboards.push(data)
    },
    async [ACTIONS.EDIT_DASHBOARD]({ state, getters }, { id, name }) {
      const { data } = await getters.api(`/me/dashboard/${id}`, {
        method: 'PUT',
        data: { name }
      })
      const dash = _.find(state.dashboards, { id })
      dash.name = data.name
    },
    async [ACTIONS.DELETE_DASHBOARD]({ state, getters }, id) {
      const { data } = await getters.api(`/me/dashboard/${id}`, {
        method: 'DELETE'
      })
      const index = _.findIndex(state.dashboards, { id })
      state.dashboards.splice(index, 1)
      console.log(data)
    },
    async [ACTIONS.SHARE_DASHBOARD]({ state, getters }, { dashId, username }) {
      return getters.api(`/me/dashboard/share/${dashId}/to/${username}`, {
        method: 'POST'
      })
    },
    async [ACTIONS.LOAD_ME]({ state, getters, dispatch }) {
      try {
        const { data } = await getters.api('/me')
        state.user = data
      } catch (err) {
        console.error(err)
        if (err.response && err.response.status === 401) {
          dispatch(ACTIONS.LOGOUT)
        }
      }
    },
    async [ACTIONS.LOAD_LOGS]({ state, getters }, params) {
      const { data } = await getters.api('/logs', { params })
      return data
    },
    async [ACTIONS.LOAD_COUNTS]({ state, getters }, params) {
      const { data } = await getters.api('/counts', { params })
      return data
    },
    async [ACTIONS.LOAD_COUNTS_SNIPPET]({ state, getters }, params) {
      const { data } = await getters.api('/counts/snippet', { params })
      return data
    },
    async [ACTIONS.PAUSE_LOGS]({ state }, paused) {
      return state.sock.pause(!!paused)
    },
    async [ACTIONS.LOAD_LOGS_STATS]({ getters }, dashId) {
      const { data } = await getters.api(`/logs/stats/${dashId}`)
      return data
    },
    async [ACTIONS.LOAD_COUNTS_STATS]({ getters }, dashId) {
      const { data } = await getters.api(`/counts/stats/${dashId}`)
      return data
    },
    async [ACTIONS.LOAD_GLOBALS]({ state, getters }) {
      const { data } = await getters.api('/globals')
      console.log(data)
      state.version = data.version
      state.org = data.org
      return data
    }
  }
})

export default store
