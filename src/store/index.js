import axios from 'axios'
import Vue from 'vue'
import Vuex from 'vuex'
import jwtDecode from 'jwt-decode'
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
    jwt: localStorage.getItem('jwt')
  },
  getters: {
    dashgroups (state) {
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
    jwtPayload (state) {
      return jwtDecode(state.jwt)
    },
    api: state => (path, options = {}) => {
      return axios({
        method: 'GET',
        url: process.env.VUE_APP_REST + path,
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
    }
  },
  actions: {
    [ACTIONS.LOGOUT] ({ commit }) {
      localStorage.removeItem('jwt')
      location.href = '/login'
    },
    async [ACTIONS.LOAD_DASHBOARDS] ({ state, getters }) {
      const { data } = await getters.api('/me/dashboards')
      state.dashboards = data
    },
    async [ACTIONS.LOAD_SHARED] ({ state, getters }) {
      const { data } = await getters.api('/me/dashboards/shared')
      state.shared = data
    },
    async [ACTIONS.ADD_DASHBOARD] ({ state, getters }, name) {
      const { data } = await getters.api('/me/dashboard', {
        method: 'POST',
        data: { name }
      })
      state.dashboards.push(data)
    },
    async [ACTIONS.EDIT_DASHBOARD] ({ state, getters }, { id, name }) {
      const { data } = await getters.api(`/me/dashboard/${id}`, {
        method: 'PUT',
        data: { name }
      })
      console.log(data)
    },
    async [ACTIONS.DELETE_DASHBOARD] ({ state, getters }, id) {
      const { data } = await getters.api(`/me/dashboard/${id}`, {
        method: 'DELETE'
      })
      console.log(data)
    },
    async [ACTIONS.SHARE_DASHBOARD] ({ state, getters }, { dashId, username }) {
      return getters.api(`/me/dashboard/share/${dashId}/to/${username}`, {
        method: 'POST'
      })
    },
    async [ACTIONS.LOAD_ME] ({ state, getters }) {
      try {
        const { data } = await getters.api('/me')
        state.user = data
      } catch (err) {
        if (err.response && err.response.status === 401) {
          router.push('/login')
        }
      }
    },
    async [ACTIONS.LOAD_LOGS] ({ state, getters }, params) {
      const { data } = await getters.api('/logs', { params })
      return data
    },
    async [ACTIONS.PAUSE_LOGS] ({ state, getters }, params) {
      const { data } = await getters.api('/logs/pause', { params })
      return data
    },
    async [ACTIONS.LOAD_LOGS_STATS] ({ getters }) {
      const { data } = await getters.api('/logs/stats')
      return data
    }
  }
})

export default store
