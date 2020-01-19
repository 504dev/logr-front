<template>
  <div class="wrapper" v-if="this.user && this.dashboards">
    <div>
      <img class="avatar" :src="`https://avatars0.githubusercontent.com/u/${jwtPayload.github_id}`">
      <span>{{ jwtPayload.username }}</span>
      <p>{{ jwtPayload }}</p>
      <p><a href="#" @click.prevent="$store.dispatch(ACTIONS.LOGOUT)">Sign out</a></p>
    </div>
    <div>
      <h1>Own</h1>
      <span v-if="dashgroups.own.length === 0">No dashboards</span>
      <template v-else v-for="dash in dashgroups.own">
        <router-link :to="`/dashboard/${dash.id}/logs`" class="dashboard" :key="dash.id">
          <span>{{ dash.name }}</span>
        </router-link>
      </template>
      <span class="dashboard-add" @click="onAddDashboard">+</span>
    </div>
    <div>
      <h1>Shared</h1>
      <span v-if="dashgroups.shared.length === 0">No dashboards</span>
      <template v-else v-for="dash in dashgroups.shared">
        <router-link :to="`/dashboard/${dash.id}/logs`" class="dashboard" :key="dash.id">
          <span>{{ dash.name }}</span>
        </router-link>
      </template>
    </div>
  </div>
</template>

<script>
import ACTIONS from '../store/action-types'
import { mapState, mapGetters } from 'vuex'

export default {
  created () {
    this.$store.dispatch(ACTIONS.LOAD_ME)
    this.$store.dispatch(ACTIONS.LOAD_DASHBOARDS)
  },
  data () {
    return {
      ACTIONS
    }
  },
  computed: {
    ...mapGetters(['jwtPayload']),
    ...mapState(['user', 'dashboards']),
    dashgroups () {
      const own = []
      const shared = []
      if (this.dashboards) {
        this.dashboards.forEach(dash => {
          if (dash.owner_id === this.user.id) {
            own.push(dash)
          } else {
            shared.push(dash)
          }
        })
      }
      return { own, shared }
    }
  },
  methods: {
    async onAddDashboard () {
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
  .dashboard {
    display: inline-block;
    width: 200px;
    height: 50px;
    background-color: #cccccc;
    margin: 0 20px 20px 0;
    padding: 10px;
    border-radius: 4px;
  }
  .avatar {
    width: 64px;
    height: 64px;
    border-radius: 32px;
  }
</style>
