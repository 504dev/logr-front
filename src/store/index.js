import axios from 'axios'
import Vue from 'vue'
import Vuex from 'vuex'
import ACTIONS from './action-types.js'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    user: null,
    dashboards: null
  },
  getters: {
    //
  },
  actions: {
    [ACTIONS.LOGOUT] () {
      localStorage.removeItem('jwt')
      location.href = '/login'
    },
    async [ACTIONS.LOAD_DASHBOARDS] ({ state }) {
      const { data } = await axios.get('http://api.kidlog.loc:7778/me/dashboards')
      state.dashboards = data
    },
    async [ACTIONS.LOAD_ME] ({ state }) {
      const { data } = await axios.get('http://api.kidlog.loc:7778/me')
      state.user = data
    }
  }
})

export default store
