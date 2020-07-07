<template>
  <wrapper :loading="loading" :class="{ night: mode === 0 }">
    <template v-slot:filters>
      <p style="float: right; margin-top: -35px">
        <router-link :to="`/dashboard/${dash.id}/counts`">switch to counts</router-link>
      </p>
      <form @change="onChangeFilters" @submit.prevent>
        <select v-model="filters.logname" id="filter-logname" :class="{ selected: filters.logname }">
          <option value="" v-if="sortedLognames.length === 0">Logname</option>
          <option v-for="logname in sortedLognames" :value="logname" :key="logname">
            {{ logname }}
          </option>
        </select>
        <select
          v-model="filters.hostname"
          v-if="sortedHostnames.length > 1 || filters.hostname"
          id="filter-hostname"
          :class="{ selected: filters.hostname }"
        >
          <option value="">Hostname</option>
          <option v-for="hostname in sortedHostnames" :value="hostname" :key="hostname">
            {{ hostname }}
          </option>
        </select>
        <select v-model="filters.level" id="filter-level" :class="{ selected: filters.level }">
          <option value="">Level</option>
          <option v-for="level in sortedLevels" :value="level" :key="level">
            {{ level }}
          </option>
        </select>
        <select v-model="filters.version" id="filter-version" :class="{ selected: filters.version }">
          <option value="">Version</option>
          <option v-for="version in sortedVersions" :value="version" :key="version" v-if="version">
            {{ version }}
          </option>
        </select>
        <input
          type="text"
          v-model="filters.message"
          placeholder="Message"
          id="filter-message"
          :class="{ selected: filters.message }"
        />
        <!--        <input type="number" v-model="filters.pid" placeholder="Pid" id="filter-pid" maxlength="6" />-->
        <range-date-time-picker v-model="filters.timestamp" id="filter-timestamp" v-if="false" />
        <date-time-pattern
          ref="date-time-pattern"
          v-model="filters.timestamp"
          :class="{ selected: filters.timestamp.some(v => v) }"
          v-if="false"
        />
        <date-time-regexp ref="date-time-regexp" v-model="filters.pattern" :class="{ selected: filters.pattern }" />
        <input type="text" v-model="filters.limit" placeholder="Limit" id="filter-limit" />
      </form>
      <div class="bottom">
        <a href="#" @click.prevent="switchMode"><i class="fas fa-moon"></i></a>
      </div>
    </template>
    <template v-slot:content>
      <div class="logs-live column-reverse">
        <template v-for="(log, key) in logs.live">
          <div v-if="log.hr" :key="key" class="pause-line">
            <span><i class="fas fa-pause"></i> {{ log.text }}</span>
          </div>
          <log-item v-else :value="log" :filters="filters" :key="key" @tag="onTag" />
        </template>
      </div>
      <div class="logs-history">
        <log-item v-for="(log, key) in logs.history" :value="log" :filters="filters" :key="key" @tag="onTag" />
      </div>
      <div class="logs-deep" v-for="(deep, key) in logs.deep" :key="key">
        <log-item v-for="(log, key) in deep" :value="log" :filters="filters" :key="key" @tag="onTag" />
      </div>
      <span class="more" @click="onMore" v-if="offset">more <i class="fas fa-angle-down"></i></span>
      <div class="pause" :class="{ 'pause-on': paused }" @click="onPause"><i class="fas fa-pause"></i></div>
    </template>
  </wrapper>
</template>

<script>
import _ from 'lodash'
import store from 'store2'
import ACTIONS from '../store/action-types'
import MUTATIONS from '../store/mutations-types.js'
import LogItem from './LogItem'
import RangeDateTimePicker from './RangeDateTimePicker'
import DateTimePattern from './DateTimePattern'
import DateTimeRegexp from './DateTimeRegexp'
import Wrapper from './Wrapper'
import { mapState } from 'vuex'

const ls = store.namespace('logs')

export default {
  components: {
    DateTimeRegexp,
    Wrapper,
    LogItem,
    RangeDateTimePicker,
    DateTimePattern
  },
  async created() {
    await Promise.all([
      this.$store.dispatch(ACTIONS.WS_CONNECT),
      this.$store.dispatch(ACTIONS.LOAD_ME),
      this.$store.dispatch(ACTIONS.LOAD_DASHBOARDS)
    ])
    this.stats = await this.$store.dispatch(ACTIONS.LOAD_LOGS_STATS, this.dash.id)

    this.parseLocation()
    this.updateLocation()

    await this.$store.dispatch(ACTIONS.PAUSE_LOGS, this.paused)
    this.sock.on('/log', this.logHandler)

    await this.updateLogs()
  },
  destroyed() {
    this.sock.unsubscribe('/log', this.logHandler)
  },
  data() {
    return {
      paused: false,
      pausedTimer: null,
      filters: {
        hostname: '',
        logname: '',
        level: '',
        pid: '',
        version: '',
        message: '',
        limit: 100,
        timestamp: [],
        pattern: ''
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
    ...mapState(['user', 'dashboards', 'sock', 'mode']),
    dash() {
      return (this.dashboards || []).find(dash => dash.id === +this.$route.params.id)
    },
    sortedHostnames() {
      return this.groupStatsBy('hostname')
    },
    sortedLognames() {
      return this.groupStatsBy('logname')
    },
    sortedLevels() {
      return this.groupStatsBy('level')
    },
    sortedVersions() {
      return this.groupStatsBy('version', 'updated').slice(0, 10)
    },
    offset() {
      const list = _.last(this.logs.deep) || this.logs.history
      return _.chain(list)
        .last()
        .get('timestamp')
        .value()
    }
  },
  methods: {
    onTag(value) {
      console.log('onTag', value)
      if (value.timestamp) {
        if (this.$refs['date-time-pattern']) {
          const pattern = this.$refs['date-time-pattern'].$el.firstChild
          pattern.value = value.timestamp
          pattern.dispatchEvent(new Event('change', { bubbles: true }))
        }
        if (this.$refs['date-time-regexp']) {
          const regexp = this.$refs['date-time-regexp'].$el.firstChild
          regexp.value = value.timestamp
          regexp.dispatchEvent(new Event('change', { bubbles: true }))
        }
        return
      }
      Object.assign(this.filters, value)
      this.onChangeFilters()
    },
    parseLocation() {
      let {
        hostname = '',
        logname = '',
        level = '',
        pid = '',
        version = '',
        message = '',
        timestamp = [],
        pattern = '',
        limit = 100,
        paused
      } = this.$route.query
      if (logname === '') {
        logname = _.find(this.sortedLognames, { logname: ls.get(`dash${this.dash.id}.filters.logname`) })
        logname = logname || this.sortedLognames[0] || ''
      }
      timestamp = []
        .concat(timestamp)
        .map(t => +t || 0)
        .concat([0, 0])
        .slice(0, 2)

      this.paused = parseInt(paused) || 0
      this.filters = {
        hostname,
        logname,
        level,
        pid,
        version,
        message,
        limit,
        timestamp,
        pattern
      }
    },
    logHandler(data) {
      console.log('/log', data)
      if (this.loading || this.paused) {
        return
      }
      this.logs.live.push(data.payload)
    },
    async onMore(e) {
      console.log('onMore', e)
      const logs = await this.$store.dispatch(ACTIONS.LOAD_LOGS, {
        ...this.filters,
        dash_id: this.dash.id,
        sock_id: this.sock.id,
        offset: this.offset
      })
      this.logs.deep.push(logs)
    },
    async onPause(e) {
      console.log('onPause', e)
      this.paused = 1 - this.paused
      await this.$store.dispatch(ACTIONS.PAUSE_LOGS, this.paused)
      this.updateLocation()
      if (this.pausedTimer) {
        clearInterval(this.pausedTimer)
      }
      if (this.paused) {
        const hr = {
          hr: true,
          timestamp: Date.now(),
          text: '00:00'
        }
        this.pausedTimer = setInterval(() => {
          hr.text = new Date(Date.now() - hr.timestamp).toISOString().slice(14, 19)
        }, 1000)
        this.logs.live.push(hr)
      }
    },
    async onChangeFilters(e) {
      console.log('onChangeFilters', e)
      ls.set(`dash${this.dash.id}.filters.logname`, this.filters.logname)

      await this.updateLogs()
      this.updateLocation()
    },
    updateLocation() {
      let query = { ...this.filters, paused: this.paused }
      if (query.timestamp[0] === 0 && query.timestamp[1] === 0) {
        delete query.timestamp
      }
      query = _.pickBy(query)
      this.$router.replace({ query })
    },
    async updateLogs() {
      this.loading = true
      this.logs.live = []
      this.logs.deep = []
      this.logs.history = await this.$store.dispatch(ACTIONS.LOAD_LOGS, {
        ...this.filters,
        dash_id: this.dash.id,
        sock_id: this.sock.id
      })
      this.loading = false
    },
    groupStatsBy(fieldname, sort = 'cnt') {
      return _.chain(this.stats)
        .groupBy(fieldname)
        .map((group, key) => {
          const cnt = _.sumBy(group, 'cnt')
          const updated = _.chain(group)
            .map('updated')
            .max()
            .value()
          return { [fieldname]: key, cnt, updated }
        })
        .sortBy(v => -v[sort])
        .map(fieldname)
        .value()
    },
    switchMode() {
      this.$store.commit(MUTATIONS.SWITCH_MODE)
    }
  }
}
</script>

<style lang="scss" scoped>
select#filter-logname {
}
select#filter-hostname {
}
select#filter-level {
  width: 40%;
}
select#filter-version {
  width: 55%;
  float: right;
}
input#filter-pid {
  width: 40%;
}
input#filter-message {
  width: 100%;
  height: 50px;
  font-size: 20px;
}
#filter-timestamp {
}
input#filter-limit {
  width: 60px;
  margin-top: 10px;
}

.logs-live {
  border-bottom: dashed 1px grey;
}
.logs-history {
  opacity: 0.8;
}
.logs-deep {
  border-top: 1px dashed grey;
  opacity: 0.7;
  margin-top: 5px;
}
.column-reverse {
  display: flex;
  flex-direction: column-reverse;
}

.more {
  width: 250px;
  height: 25px;
  line-height: 25px;
  vertical-align: middle;
  display: inline-block;
  margin: 5px 0 0 0;
  text-align: center;
  padding: 0 5px;
  background-color: green;
  color: white;
  border-radius: 4px;
  opacity: 0.8;
  cursor: pointer;
  &:hover {
    opacity: 1;
  }
}

.pause {
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
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
  border-radius: 10px 10px 0 0;
  border: solid 2px white;
  border-bottom: none;
  overflow: hidden;
  background-color: rgba(128, 128, 128, 0.5);
  cursor: pointer;
  margin-left: 70px;
  &:hover {
    /*zoom: 1.1;*/
    background-color: rgba(128, 128, 128, 0.5);
  }
  &.pause-on {
    border-color: rgb(0, 128, 128);
    /*zoom: 1.1;*/
    background-color: rgb(0, 128, 128);
    &:hover {
      background-color: rgb(0, 128, 128);
    }
  }
}

.pause-line {
  border-top: dashed 1px #088;
  span {
    color: #fff;
    font-size: 10px;
    background-color: #088;
    padding: 2px 4px;
    border-radius: 0 0 3px 3px;
    position: absolute;
    left: 100vw;
    margin-left: -60px;
    margin-top: -1px;
  }
}

.bottom {
  /*text-align: right;*/
  position: absolute;
  left: 0;
  right: 0;
  bottom: 20px;
  padding: 10px;
}
</style>
