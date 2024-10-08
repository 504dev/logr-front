import Vue from 'vue'
import { createStore } from 'vuex'
import { jwtDecode } from 'jwt-decode'
import _find from 'lodash/find'
import _findIndex from 'lodash/findIndex'
import _filter from 'lodash/filter'
import _omit from 'lodash/omit'
import ls from 'store2'
import _first from 'lodash/first.js'
import _get from 'lodash/get.js'
import Sock from '@/libs/sock'
import { RoleDemo } from '@/constants/roles'
import ACTIONS from '@/store/action-types.js'
import MUTATIONS from '@/store/mutations-types.js'
import demoStore from '@/store/demo'

console.log(import.meta.env)

export const store = createStore({
  state: {
    user: null,
    dashboards: null,
    shared: null,
    jwt: ls.get('jwt'),
    sock: null,
    theme: ls.get('theme', 0),
    orient: ls.get('orient', 0),
    direction: ls.get('direction', 1),
    fullscreen: 0,
    globals: null,
    redirectUrl: ls.get('redirect_url'),
    lognames: { logs: {}, counts: {} }
  },
  getters: {
    restUrl() {
      return import.meta.env.VITE_REST || location.origin
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
    expiredAt(state, getters) {
      return getters.jwtPayload ? getters.jwtPayload.exp * 1000 : 0
    },
    filled: () => (list, delta, range, now) => {
      if (list.length === 0) {
        return list
      }
      const filled = [] //list.slice(0, 1)
      let lastDate = now || Date.now() //_last(list)[0]
      lastDate = lastDate - (lastDate % delta) + delta
      let firstDate = _first(list)[0]
      let firstDateAlt = lastDate - range //_first(list)[0]
      firstDate = firstDate > firstDateAlt ? firstDateAlt : firstDate
      let i = 0
      for (let t = firstDate; t <= lastDate; t += delta) {
        if (t === _get(list, [i, 0])) {
          filled.push(list[i])
          i++
        } else {
          filled.push([t, null])
        }
      }
      return filled
    },
    nFormatter: () => (num, digits = 2) => {
      const lookup = [
        { value: 0, symbol: '' },
        { value: 1e3, symbol: 'k' },
        { value: 1e6, symbol: 'M' },
        { value: 1e9, symbol: 'G' },
        { value: 1e12, symbol: 'T' },
        { value: 1e15, symbol: 'P' },
        { value: 1e18, symbol: 'E' }
      ]

      const item = lookup.findLast(item => Math.abs(num) >= item.value)
      num /= (item.value || 1)
      if (num !== 0) {
        digits -= Math.log10(Math.abs(num))
        digits = digits < 0 ? 0 : Math.round(digits)
      }

      const regexp = /\.0+$|(?<=\.[0-9]*[1-9])0+$/
      return num.toFixed(digits).replace(regexp, '').concat(item.symbol)
    },
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
    },
    [MUTATIONS.DELETE_DASHBOARD]: (state, id) => {
      const index = _findIndex(state.dashboards, { id })
      state.dashboards.splice(index, 1)
    },
    [MUTATIONS.EDIT_DASHBOARD]: (state, { id, name }) => {
      const dash = _find(state.dashboards, { id })
      dash.name = name
    },
    [MUTATIONS.MEMBER_REMOVE]: (state, id) => {
      for (const dash of state.dashboards) {
        const deleted = _find(dash.members, { id })
        if (deleted) {
          dash.members = _filter(dash.members, m => m !== deleted)
        }
      }
    }
  },
  actions: {
    [ACTIONS.LOGOUT]({ commit }) {
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
    async [ACTIONS.LOAD_ME]({ state, dispatch }) {
      try {
        const data = await api('/me')
        if (!data) {
          return dispatch(ACTIONS.LOGOUT)
        }
        state.user = data
      } catch (err) {
        console.error(err)
        if (err.response && err.response.status === 401) {
          return dispatch(ACTIONS.LOGOUT)
        }
      }
    },
    async [ACTIONS.LOAD_DASHBOARDS]({ state }) {
      if (state.dashboards) {
        return
      }
      state.dashboards = await api('/me/dashboards')
    },
    async [ACTIONS.LOAD_SHARED]({ state }) {
      state.shared = await api('/me/dashboards/shared')
    },
    async [ACTIONS.ADD_DASHBOARD]({ state }, name) {
      if (state.user.role === RoleDemo) {
        return demoStore.actions[ACTIONS.ADD_DASHBOARD](store, name)
      }
      const data = await api('/me/dashboard', {
        method: 'POST',
        data: { name }
      })
      state.dashboards.push({ ...data, members: [] })
    },
    async [ACTIONS.EDIT_DASHBOARD]({ state, commit }, { id, name }) {
      if (state.user.role === RoleDemo) {
        return commit(MUTATIONS.EDIT_DASHBOARD, { id, name })
      }
      const data = await api(`/me/dashboard/${id}`, {
        method: 'PUT',
        data: { name }
      })
      commit(MUTATIONS.EDIT_DASHBOARD, data)
    },
    async [ACTIONS.DELETE_DASHBOARD]({ state, commit }, id) {
      if (state.user.role === RoleDemo) {
        return commit(MUTATIONS.DELETE_DASHBOARD, id)
      }
      await api(`/me/dashboard/${id}`, { method: 'DELETE' })
      commit(MUTATIONS.DELETE_DASHBOARD, id)
    },
    async [ACTIONS.MEMBER_ADD]({ state }, { dash, member }) {
      if (state.user.role === RoleDemo) {
        return demoStore.actions[ACTIONS.MEMBER_ADD](store, { dash, member })
      }
      const data = await api(`/me/dashboard/${dash.id}/member`, {
        params: { username: member.login },
        method: 'POST'
      })
      dash.members.push(data)
      return data
    },
    async [ACTIONS.MEMBER_REMOVE]({ state, commit }, { dash, id }) {
      if (state.user.role === RoleDemo) {
        commit(MUTATIONS.MEMBER_REMOVE, id)
        return {}
      }
      const data = await api(`/me/dashboard/${dash.id}/member`, {
        params: { id },
        method: 'DELETE'
      })
      commit(MUTATIONS.MEMBER_REMOVE, id)
      return data
    },
    async [ACTIONS.LOAD_LOGS](_, params) {
      return api('/logs', { params })
    },
    async [ACTIONS.LOAD_COUNTS](_, params) {
      return api('/counts', { params })
    },
    async [ACTIONS.LOAD_COUNTS_SNIPPET](_, params) {
      const dashId = params.dash_id
      params = _omit(params, 'dash_id')
      return api(`/counts/${dashId}/snippet`, { params })
    },
    async [ACTIONS.PAUSE_LOGS]({ state }, paused) {
      return state.sock.pause(!!paused)
    },
    async [ACTIONS.LOAD_LOGS_LOGNAMES]({ state }, dashId) {
      const cached = state.lognames.logs[dashId]
      if (cached) {
        return cached
      }
      const data = await api(`/logs/${dashId}/lognames`).catch(() => [])
      state.lognames.logs[dashId] = data
      return data
    },
    async [ACTIONS.LOAD_COUNTS_LOGNAMES]({ state }, dashId) {
      const cached = state.lognames.counts[dashId]
      if (cached) {
        return cached
      }
      const data = await api(`/counts/${dashId}/lognames`).catch(() => [])
      state.lognames.counts[dashId] = data
      return data
    },
    async [ACTIONS.LOAD_LOGS_STATS](_, { dashId, logname }) {
      return api(`/logs/${dashId}/stats`, { params: { logname } })
    },
    async [ACTIONS.LOAD_COUNTS_STATS](_, { dashId, logname }) {
      return api(`/counts/${dashId}/stats`, { params: { logname } })
    },
    async [ACTIONS.LOAD_GLOBALS]({ state }) {
      const data = await api('/globals', {}, false)
      console.log(data)
      state.globals = data
      return data
    },
    async [ACTIONS.LOAD_FREE_TOKEN]({ getters }) {
      const url = `${getters.restUrl}/api/free-token`
      const response = await fetch(url)
      return response.json()
    }
  }
})

async function api(path, options = {}, useAuth = true) {
  const { state, getters, dispatch, commit } = store

  if (useAuth && Date.now() > getters.expiredAt) {
    commit(MUTATIONS.SET_REDIRECT, location.href)
    dispatch(ACTIONS.LOGOUT)
    return
  }

  const { params = {}, data, method = 'GET' } = options

  let fetchUrl = `${getters.restUrl}/api${path}?${new URLSearchParams(params).toString()}`

  const response = await fetch(fetchUrl, {
    method,
    headers: useAuth ? { Authorization: `Bearer ${state.jwt}` } : {},
    body: data ? JSON.stringify(data) : null,
  })

  if (!response.ok) {
    const error = new Error(`HTTP error! status: ${response.status}`)
    error.response = response
    throw error
  }

  return response.json()
}
