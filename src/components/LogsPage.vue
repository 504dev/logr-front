<template>
  <div class="wrapper" v-if="this.user && this.dash">
    <div class="lefter">
      <img class="avatar" :src="`https://avatars0.githubusercontent.com/u/${user.github_id}`">
      <h3><router-link to="/dashboards">..</router-link>/{{ dash.name }}</h3>
      <form class="filters" @change="onChange" @submit.prevent>
        <select v-model="filters.logname">
          <option value="">Any logname</option>
          <option v-for="{ logname } in sortedLognames" :value="logname" :key="logname">
            {{ logname }}
          </option>
        </select>
        <select v-model="filters.hostname">
          <option value="">Any hostname</option>
          <option v-for="{ hostname } in sortedHostnames" :value="hostname" :key="hostname">
            {{ hostname }}
          </option>
        </select>
        <select v-model="filters.level">
          <option value="">Any level</option>
          <option v-for="{ level } in sortedLevels" :value="level" :key="level">
            {{ level }}
          </option>
        </select>
        <input type="text" v-model="filters.message" placeholder="Message" />
        <div>{{ computedFilters }}</div>
      </form>
    </div>
    <div class="container" :class="{ 'filter-logname': !!filters.logname, 'filter-hostname': !!filters.hostname }">
      <span v-if="loading">Loading...</span>
      <span v-else>
        <div class="logs-live column-reverse">
          <log-item v-for="(log, key) in logs.live" :value="log" :key="key" />
        </div>
        <div class="logs-history">
          <log-item v-for="(log, key) in logs.history" :value="log" :key="key" />
        </div>
      </span>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import ACTIONS from '../store/action-types'
import Sock from '../libs/sock'
import LogItem from './LogItem'
import { mapState } from 'vuex'

export default {
  components: {
    LogItem
  },
  async created () {
    await Promise.all([
      this.$store.dispatch(ACTIONS.LOAD_ME),
      this.$store.dispatch(ACTIONS.LOAD_DASHBOARDS)
    ])
    this.stats = await this.$store.dispatch(ACTIONS.LOAD_LOGS_STATS, this.dashid)

    this.sock = new Sock('ws://api.kidlog.loc:7778/ws', this.jwt)
    const event = await this.sock.connect()
    console.log('ws connected', event)
    this.sock.on('/log', data => {
      if (this.loading) {
        return
      }
      console.log('/log', data)
      const log = data.payload
      this.logs.live.push(log)
    })

    this.updateLogs()
  },
  data () {
    return {
      sock: null,
      filters: {
        hostname: '',
        logname: '',
        level: ''
      },
      logs: {
        live: [],
        history: []
      },
      stats: [],
      loading: true
    }
  },
  watch: {
    dash () {
      //
    }
  },
  computed: {
    ...mapState(['user', 'dashboards', 'jwt']),
    dashid () {
      return +this.$route.params.id
    },
    dash () {
      if (!this.dashboards) {
        return null
      }
      return this.dashboards.find(dash => dash.id === this.dashid)
    },
    computedFilters () {
      return _.pickBy({ ...this.filters, dash_id: this.dashid })
    },
    sortedHostnames () {
      return this.groupStatsBy('hostname')
    },
    sortedLognames () {
      return this.groupStatsBy('logname')
    },
    sortedLevels () {
      return this.groupStatsBy('level')
    }
  },
  methods: {
    onChange (e) {
      console.log(e)
      this.updateLogs()
    },
    async updateLogs () {
      this.loading = true
      this.logs.live = []
      this.logs.history = await this.$store.dispatch(ACTIONS.LOAD_LOGS, {
        ...this.computedFilters,
        sock_id: this.sock.id
      })
      this.loading = false
    },
    groupStatsBy (fieldname) {
      return _.chain(this.stats)
        .groupBy(fieldname)
        .map((group, key) => {
          const cnt = _.sumBy(group, 'cnt')
          return { [fieldname]: key, cnt }
        })
        .sortBy(v => -v.cnt)
        .value()
    }
  }
}
</script>

<style>
  .container.filter-logname .log-logname {
    display: none;
  }
  .container.filter-hostname .log-hostname {
    display: none;
  }
</style>

<style scoped>
  .avatar {
    width: 64px;
    height: 64px;
    border-radius: 32px;
  }
  .lefter {
    position: fixed;
    padding: 10px;
    height: 100%;
    width: 200px;
    background-color: rgba(224, 224, 224, 0.9);
    z-index: 1000;
  }
  .container {
    font-family: Courier;
    font-size: 14px;
    position: absolute;
    height: 100%;
    width: 100%;
    padding: 10px 0 0 230px;
    overflow: scroll;
    z-index: 900;
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
  .logs-live {
    outline: dashed 1px red;
  }
  .logs-history {
    outline: dashed 1px green;
  }
  .column-reverse {
    display: flex;
    flex-direction: column-reverse;
  }
</style>
