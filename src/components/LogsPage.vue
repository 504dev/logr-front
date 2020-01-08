<template>
  <div class="wrapper" v-if="this.user && this.dashboards">
    <div class="lefter">
      <img class="avatar" :src="`https://avatars0.githubusercontent.com/u/${user.github_id}`">
      <h3><router-link to="/dashboards">..</router-link>/{{ dash.name }}</h3>
      <form class="filters" @change="onChange">
        <select v-model="filters.hostname">
          <option value="">Hostname</option>
        </select>
        <select v-model="filters.logname">
          <option value="">Logname</option>
        </select>
        <select v-model="filters.level">
          <option value="0">Level</option>
          <option value="1">debug</option>
          <option value="2">info</option>
          <option value="3">warning</option>
          <option value="4">error</option>
        </select>
        <input type="text" v-model="filters.message" placeholder="Message" />
        <div>{{ filters }}</div>
      </form>
    </div>
    <div class="container">
      logs
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
      filters: {
        hostname: '',
        logname: '',
        level: 0
      }
    }
  },
  methods: {
    onChange (e) {
      console.log(e)
    }
  },
  computed: {
    ...mapState(['user', 'dashboards']),
    dash () {
      return this.dashboards.find(dash => dash.id === +this.$route.params.id)
    }
  }
}
</script>

<style scoped>
  .avatar {
    width: 64px;
    height: 64px;
    border-radius: 32px;
  }
  .lefter {
    position: absolute;
    padding: 10px;
    height: 100%;
    width: 200px;
    background-color: rgba(128, 128, 128, 0.2);
  }
  .container {
    padding: 10px 0 0 230px;
  }
  .filters {
    margin-top: 20px;
    display: block;
  }
  .filters > select, input {
    display: block;
    margin-bottom: 10px;
    width: 100%;
  }
</style>
