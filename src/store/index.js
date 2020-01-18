import axios from 'axios'
import Vue from 'vue'
import Vuex from 'vuex'
import jwtDecode from 'jwt-decode'
import router from '../router'
import ACTIONS from './action-types.js'
import MUTATIONS from './mutations-types.js'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    user: null,
    dashboards: null,
    jwt: localStorage.getItem('jwt')
  },
  getters: {
    jwtPayload (state) {
      return jwtDecode(state.jwt)
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
    async [ACTIONS.LOAD_DASHBOARDS] ({ state }) {
      const { data } = await axios({
        method: 'get',
        url: 'http://api.kidlog.loc:7778/me/dashboards',
        headers: { Authorization: `Bearer ${state.jwt}` }
      })
      state.dashboards = data
    },
    async [ACTIONS.LOAD_ME] ({ state }) {
      try {
        const { data } = await axios({
          method: 'get',
          url: 'http://api.kidlog.loc:7778/me',
          headers: { Authorization: `Bearer ${state.jwt}` }
        })
        state.user = data
      } catch (err) {
        if (err.response && err.response.status === 401) {
          router.push('/login')
        }
      }
    }
  }
})

export default store
