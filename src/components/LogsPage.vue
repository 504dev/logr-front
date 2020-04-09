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
        <input type="text" v-model="filters.message" placeholder="Message" class="filter-message" />
        <input type="text" v-model="filters.limit" placeholder="Limit" class="filter-limit" />
        <range-date-time-picker v-model="filters.timestamp" />
      </form>
    </div>
    <div class="container" :class="{ 'filter-logname': !!filters.logname, 'filter-hostname': !!filters.hostname }">
      <span v-if="loading">Loading...</span>
      <span v-else>
        <div class="logs-live column-reverse">
          <log-item v-for="(log, key) in logs.live" :value="log" :filters="filters" :key="key" />
        </div>
        <div class="logs-history">
          <log-item v-for="(log, key) in logs.history" :value="log" :filters="filters" :key="key" />
        </div>
        <div class="logs-deep" v-for="(deep, key) in logs.deep" :key="key">
          <log-item v-for="(log, key) in deep" :value="log" :filters="filters" :key="key" />
        </div>
        <span class="more" @click="onMore">more  ˅</span>
      </span>
    </div>
    <div class="pause" :class="{ 'pause-on': paused }" @click="onPause">
      &nbsp;▌▌
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import ACTIONS from '../store/action-types'
import Sock from '../libs/sock'
import LogItem from './LogItem'
import RangeDateTimePicker from './RangeDateTimePicker'
import { mapState } from 'vuex'

export default {
  components: {
    LogItem,
    RangeDateTimePicker
  },
  async created () {
    await Promise.all([
      this.$store.dispatch(ACTIONS.LOAD_ME),
      this.$store.dispatch(ACTIONS.LOAD_DASHBOARDS)
    ])
    this.stats = await this.$store.dispatch(ACTIONS.LOAD_LOGS_STATS, this.dashid)

    this.sock = new Sock(process.env.VUE_APP_WS, this.jwt)
    const event = await this.sock.connect(this.paused)
    console.log('ws connected', event)
    this.sock.on('/log', data => {
      if (this.loading || this.paused) {
        return
      }
      this.logs.live.push(data.payload)
    })
    this.sock.on('/log', data => console.log('/log', data))

    await this.updateLogs()
  },
  data () {
    let { hostname = '', logname = '', level = '', message = '', timestamp = [], limit = 100, paused } = this.$route.query
    timestamp = [].concat(timestamp).map(t => +t || 0).concat([0, 0]).slice(0, 2)
    paused = parseInt(paused) || 0
    return {
      sock: null,
      paused,
      filters: {
        hostname,
        logname,
        level,
        message,
        limit,
        timestamp
      },
      logs: {
        live: [],
        history: [],
        deep: []
      },
      stats: [],
      loading: true
    }
  },
  watch: {
    //
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
    sortedHostnames () {
      return this.groupStatsBy('hostname')
    },
    sortedLognames () {
      return this.groupStatsBy('logname')
    },
    sortedLevels () {
      return this.groupStatsBy('level')
    },
    offset () {
      const list = _.last(this.logs.deep) || this.logs.history
      return _.chain(list).last().get('timestamp').value()
    }
  },
  methods: {
    async onMore (e) {
      console.log('onMore', e)
      const logs = await this.$store.dispatch(ACTIONS.LOAD_LOGS, {
        ...this.filters,
        dash_id: this.dashid,
        sock_id: this.sock.id,
        offset: this.offset
      })
      this.logs.deep.push(logs)
    },
    async onPause (e) {
      console.log('onPause', e)
      this.paused = 1 - this.paused
      await this.$store.dispatch(ACTIONS.PAUSE_LOGS, {
        sock_id: this.sock.id,
        state: !!this.paused
      })
      this.updateLocation()
    },
    async onChange (e) {
      console.log('onChange', e)
      await this.updateLogs()
      this.updateLocation()
    },
    updateLocation () {
      const query = _.pickBy({ ...this.filters, paused: this.paused })
      this.$router.replace({ query })
    },
    async updateLogs () {
      this.loading = true
      this.logs.live = []
      this.logs.deep = []
      this.logs.history = await this.$store.dispatch(ACTIONS.LOAD_LOGS, {
        ...this.filters,
        dash_id: this.dashid,
        sock_id: this.sock.id
      })
      this.loading = false
    },
    groupStatsBy (fieldname) {
      return _.chain(this.stats)
        .filter({ dash_id: this.dashid })
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
  .more {
    display: inline-block;
    margin: 5px 0;
    padding: 0 5px;
    background-color: green;
    color: white;
    border-radius: 4px;
    opacity: 0.5;
    cursor: pointer;
  }
  .more:hover {
    opacity: 0.7;
  }
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
    z-index: 901;
  }
  .pause {
    /*zoom: 0.5;*/
    position: fixed;
    z-index: 900;
    left: 50%;
    bottom: 0;
    width: 80px;
    height: 50px;
    line-height: 50px;
    font-size: 20px;
    color: white;
    text-align: center;
    /*border-radius: 10px 10px 0 0;*/
    overflow: hidden;
    background-color: rgba(128, 128, 128, .4);
    cursor: pointer;
    margin-left: -40px;
  }
  .pause:hover {
    zoom: 1.1;
    background-color: rgba(128, 128, 128, .5);
  }
  .pause-on {
    zoom: 1.1;
    background-color: rgba(0, 128, 128, .5);
  }
  .pause-on:hover {
    background-color: rgba(0, 128, 128, .4);
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
    box-sizing: border-box;
    display: block;
    margin-bottom: 10px;
    width: 100%;
    height: 30px;
    padding: 0 10px;
  }
  .filters > select, input {
    border: solid 1px #999;
  }
  .filters > input:focus {
    outline: none;
    border-bottom: solid 1px green;
  }
  .filter-message {
    width: 100%;
  }
  .filter-limit {
    /*float: right;*/
    width: 25%;
  }
  .logs-live {
    border-bottom: dashed 1px red;
  }
  .logs-history {
    /*border-top: dashed 1px green;*/
    opacity: 0.7;
  }
  .logs-deep {
    border-top: 1px dashed green;
    opacity: 0.7;
    margin-top: 5px;
  }
  .column-reverse {
    display: flex;
    flex-direction: column-reverse;
  }
</style>
