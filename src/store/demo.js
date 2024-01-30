import Vue from 'vue'
import Vuex from 'vuex'
import ACTIONS from './action-types.js'

Vue.use(Vuex)

const store = {
  actions: {
    async [ACTIONS.MEMBER_ADD](_, { dash, member }) {
      dash.members.push({
        id: Date.now(),
        dash_id: dash.id,
        user: {
          username: member.login,
          github_id: member.id
        }
      })
    },
    async [ACTIONS.ADD_DASHBOARD]({ state }, name) {
      state.dashboards.push({
        id: Date.now(),
        owner_id: state.user.id,
        name,
        keys: [
          {
            public_key: 'PUBLIC_KEY',
            private_key: 'PRIVATE_KEY'
          }
        ],
        members: [],
        owner: state.user
      })
    }
  }
}

export default store
