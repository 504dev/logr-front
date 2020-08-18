import _ from 'lodash'
import axios from 'axios'
import ls from 'store2'
import Vue from 'vue'
import Vuex from 'vuex'
import jwtDecode from 'jwt-decode'
import Sock from '../libs/sock'
import ACTIONS from './action-types.js'
import MUTATIONS from './mutations-types.js'

Vue.use(Vuex)

console.log(process.env)

const store = new Vuex.Store({
  state: {
    user: null,
    dashboards: null,
    shared: null,
    jwt: ls.get('jwt'),
    sock: null,
    theme: ls.get('theme', 0),
    orient: ls.get('orient', 0),
    direction: ls.get('direction', 0),
    fullscreen: 0,
    version: null,
    org: null,
    redirectUrl: ls.get('redirect_url')
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
    }
  },
  mutations: {
    [MUTATIONS.SET_JWT]: (state, token) => {
      ls.set('jwt', token)
      state.jwt = token
    },
    [MUTATIONS.UNSET_JWT]: (state, token) => {
      ls.remove('jwt', token)
      state.jwt = null
    },
    [MUTATIONS.SWITCH_THEME]: state => {
      state.theme = 1 - state.theme
      ls.set('theme', state.theme)
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
    },
    [MUTATIONS.SWITCH_DIRECTION]: state => {
      state.direction = 1 - state.direction
      ls.set('direction', state.direction)
    },
    [MUTATIONS.SET_REDIRECT]: (state, url) => {
      state.redirectUrl = url
      ls.set('redirect_url', url)
    },
    [MUTATIONS.FLUSH_REDIRECT]: state => {
      state.redirectUrl = ''
      ls.remove('redirect_url')
    }
  },
  actions: {
    [ACTIONS.LOGOUT]({ state, commit }, redirectUrl) {
      if (redirectUrl) {
        commit(MUTATIONS.SET_REDIRECT, location.href)
      }
      commit(MUTATIONS.UNSET_JWT)
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
    async [ACTIONS.LOAD_DASHBOARDS]({ state, dispatch }) {
      const { data } = await api('/me/dashboards')
      state.dashboards = data
    },
    async [ACTIONS.LOAD_SHARED]({ state, dispatch }) {
      const { data } = await api('/me/dashboards/shared')
      state.shared = data
    },
    async [ACTIONS.ADD_DASHBOARD]({ state, dispatch }, name) {
      const { data } = await api('/me/dashboard', {
        method: 'POST',
        data: { name }
      })
      state.dashboards.push(data)
    },
    async [ACTIONS.EDIT_DASHBOARD]({ state, dispatch }, { id, name }) {
      const { data } = await api(`/me/dashboard/${id}`, {
        method: 'PUT',
        data: { name }
      })
      const dash = _.find(state.dashboards, { id })
      dash.name = data.name
    },
    async [ACTIONS.DELETE_DASHBOARD]({ state, dispatch }, id) {
      const { data } = await api(`/me/dashboard/${id}`, {
        method: 'DELETE'
      })
      const index = _.findIndex(state.dashboards, { id })
      state.dashboards.splice(index, 1)
      console.log(data)
    },
    async [ACTIONS.SHARE_DASHBOARD]({ state, dispatch }, { dashId, username }) {
      return api(`/me/dashboard/share/${dashId}/to/${username}`, {
        method: 'POST'
      })
    },
    async [ACTIONS.LOAD_ME]({ state, dispatch }) {
      try {
        const { data } = await api('/me')
        state.user = data
      } catch (err) {
        console.error(err)
        if (err.response && err.response.status === 401) {
          dispatch(ACTIONS.LOGOUT, location.href)
        }
      }
    },
    async [ACTIONS.LOAD_LOGS]({ dispatch }, params) {
      const { data } = await api('/logs', { params })
      return data
    },
    async [ACTIONS.LOAD_COUNTS]({ dispatch }, params) {
      const { data } = await api('/counts', { params })
      return data
    },
    async [ACTIONS.LOAD_COUNTS_SNIPPET]({ dispatch }, params) {
      const { data } = await api('/counts/snippet', { params })
      return data
    },
    async [ACTIONS.PAUSE_LOGS]({ state }, paused) {
      return state.sock.pause(!!paused)
    },
    async [ACTIONS.LOAD_LOGS_STATS]({ dispatch }, dashId) {
      const { data } = await api(`/logs/stats/${dashId}`)
      return data
    },
    async [ACTIONS.LOAD_COUNTS_STATS]({ dispatch }, dashId) {
      const { data } = await api(`/counts/stats/${dashId}`)
      return data
    },
    async [ACTIONS.LOAD_LOGS_LOGNAMES]({ dispatch }, dashId) {
      const { data } = await api(`/logs/lognames/${dashId}`)
      return data
    },
    async [ACTIONS.LOAD_COUNTS_LOGNAMES]({ dispatch }, dashId) {
      const { data } = await api(`/counts/lognames/${dashId}`)
      return data
    },
    async [ACTIONS.LOAD_GLOBALS]({ state, dispatch }) {
      const { data } = await api('/globals')
      console.log(data)
      state.version = data.version
      state.org = data.org
      return data
    },
    async [ACTIONS.LOAD_FREE_TOKEN]({ getters }) {
      const url = `${getters.restUrl}/api/free-token`
      const { data } = await axios({ method: 'GET', url })
      return data
    }
  }
})

function api(path, options = {}) {
  const { state, getters, dispatch } = store;
  if (getters.isExpired) {
    dispatch(ACTIONS.LOGOUT, location.href)
    return
  }
  return axios({
    method: 'GET',
    url: `${getters.restUrl}/api${path}`,
    headers: {Authorization: `Bearer ${state.jwt}`},
    ...options
  })
}

export default store
