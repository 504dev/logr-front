<template>
  <div class="wrapper" v-if="this.user && this.dashboards">
    <div>
      <img class="avatar" :src="`https://avatars0.githubusercontent.com/u/${jwtPayload.github_id}`" />
      <span>
        <strong>{{ jwtPayload.username }}</strong>
        |
        <a href="#" @click.prevent="$store.dispatch(ACTIONS.LOGOUT)">Sign out</a>
      </span>
    </div>
    <div>
      <h1>Own</h1>
      <span v-if="dashgroups.own.length === 0">No dashboards</span>
      <template v-else v-for="dash in dashgroups.own">
        <dash-item :dash="dash" :key="dash.id" />
      </template>
      <span class="dashboard-add" @click="onAddDashboard">+</span>
    </div>
    <div>
      <h1>Shared</h1>
      <span v-if="dashgroups.shared.length === 0">No dashboards</span>
      <template v-else v-for="dash in dashgroups.shared">
        <dash-item :dash="dash" :key="dash.id" />
      </template>
    </div>
  </div>
</template>

<script>
import DashItem from './DashItem'
import ACTIONS from '../store/action-types'
import { mapState, mapGetters } from 'vuex'

export default {
  components: {
    DashItem
  },
  created() {
    this.$store.dispatch(ACTIONS.LOAD_ME)
    this.$store.dispatch(ACTIONS.LOAD_DASHBOARDS)
  },
  data() {
    return {
      ACTIONS
    }
  },
  computed: {
    ...mapGetters(['jwtPayload', 'dashgroups']),
    ...mapState(['user', 'dashboards'])
  },
  methods: {
    async onAddDashboard() {
      const name = prompt('Enter dashboard name:')
      await this.$store.dispatch(ACTIONS.ADD_DASHBOARD, name)
    }
  }
}
</script>

<style scoped>
.wrapper {
  padding: 20px;
}
.dashboard-add {
  color: #ffffff;
  font-weight: bold;
  background-color: #9e9;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
.avatar {
  width: 64px;
  height: 64px;
  border-radius: 32px;
}
</style>
