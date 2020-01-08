<template>
  <div class="wrapper" v-if="this.user && this.dashboards">
    <div>
      <img class="avatar" :src="`https://avatars0.githubusercontent.com/u/${user.github_id}`">
      <a href="/login">Sign out</a>
    </div>
    <div>
      <h1>Own</h1>
      <span v-if="dashgroups.own.length === 0">No dashboards</span>
      <template v-else v-for="dash in dashgroups.own">
        <router-link :to="`/dashboard/${dash.id}/logs`" class="dashboard" :key="dash.id">
          <span>{{ dash.name }}</span>
        </router-link>
      </template>
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
import { mapState } from 'vuex'

export default {
  created () {
    this.$store.dispatch(ACTIONS.LOAD_ME)
    this.$store.dispatch(ACTIONS.LOAD_DASHBOARDS)
  },
  data () {
    return {
      //
    }
  },
  computed: {
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
  }
}
</script>

<style scoped>
  .wrapper {
    padding: 20px;
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
