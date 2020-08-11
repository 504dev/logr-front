<template>
  <wrapper :loading="loading" :class="{ night: !theme, reverse: !direction }">
    <template v-slot:goto>
      <router-link :to="`/dashboard/${dash.id}/counts`">switch to counts</router-link>
    </template>

    <template v-slot:filters>
      <form @change="onChangeFilters" @submit.prevent>
        <select v-model="filters.logname" id="filter-logname" :class="{ selected: filters.logname }">
          <option value="" v-if="sortedLognames.length === 0">Logname</option>
          <option v-for="logname in sortedLognames" :value="logname" :key="logname">
            {{ logname }}
          </option> </select
        ><select
          v-model="filters.hostname"
          v-if="sortedHostnames.length > 1 || filters.hostname"
          id="filter-hostname"
          :class="{ selected: filters.hostname }"
        >
          <option value="">Hostname</option>
          <option v-for="hostname in sortedHostnames" :value="hostname" :key="hostname">
            {{ hostname }}
          </option> </select
        ><select v-model="filters.level" id="filter-level" :class="{ selected: filters.level }">
          <option value="">Level</option>
          <option v-for="level in sortedLevels" :value="level" :key="level">
            {{ level }}
          </option> </select
        ><select v-model="filters.version" id="filter-version" :class="{ selected: filters.version }">
          <option value="">Version</option>
          <option v-for="version in sortedVersions" :value="version" :key="version" v-if="version">
            {{ version }}
          </option> </select
        ><input
          type="text"
          v-model="filters.message"
          placeholder="Message"
          id="filter-message"
          :class="{ selected: filters.message }"
        /><input
          type="number"
          v-model="filters.pid"
          placeholder="Pid"
          id="filter-pid"
          maxlength="6"
          v-if="false"
        /><range-date-time-picker v-model="filters.timestamp" id="filter-timestamp" v-if="false" /><date-time-pattern
          ref="date-time-pattern"
          v-model="filters.timestamp"
          :class="{ selected: filters.timestamp.some(v => v) }"
          v-if="false"
        /><date-time-regexp
          id="filter-regexp"
          ref="date-time-regexp"
          v-model="filters.pattern"
          :class="{ selected: filters.pattern }"
          :placeholder="placeholderRe"
        /><input type="text" v-model="filters.limit" placeholder="Limit" id="filter-limit" />
      </form>
    </template>

    <template v-slot:customs>
      <a href="#" @click.prevent="switchOrient"
        ><font-awesome-icon :icon="['far', 'window-maximize']" :rotation="orient ? '270' : null"/></a
      ><a href="#" @click.prevent="switchDirection"
        ><font-awesome-icon :icon="['fas', direction ? 'sort-amount-up-alt' : 'sort-amount-down']"/></a
      ><a href="#" @click.prevent="switchMode"><font-awesome-icon :icon="[theme ? 'fas' : 'far', 'moon']"/></a>
    </template>

    <template v-slot:content>
      <div class="block block-live" :class="{ reverse: !!direction }">
        <template v-for="(log, key) in logs.live">
          <div v-if="log.hr" :key="key" class="pause-line">
            <span><font-awesome-icon icon="pause" /> {{ log.text }}</span>
          </div>
          <log-item v-else :value="log" :filters="filters" :key="key" @tag="onTag" @hover="onHover" />
        </template>
      </div>
      <div class="block block-history dashed" :class="{ reverse: !direction }">
        <log-item
          v-for="(log, key) in logs.history"
          :value="log"
          :filters="filters"
          :key="key"
          @tag="onTag"
          @hover="onHover"
        />
        <span class="cnt" :title="`${logs.history.length}rows`">{{ logs.history.length }}<small>.</small></span>
      </div>
      <div class="block block-deep dashed" :class="{ reverse: !direction }" v-for="(deep, key) in logs.deep" :key="key">
        <log-item v-for="(log, key) in deep" :value="log" :filters="filters" :key="key" @tag="onTag" @hover="onHover" />
        <span class="cnt" :title="`${deep.length}rows`">{{ deep.length }}<small>.</small></span>
      </div>
      <span class="more" @click="onMore" v-if="offset">
        more
        <font-awesome-icon icon="compact-disc" spin v-if="deepLoading" />
        <font-awesome-icon icon="chevron-circle-down" v-else />
      </span>
    </template>
    <template v-slot:pause>
      <div class="pause" :class="{ 'pause-on': paused }" @click="onPause">
        <font-awesome-icon icon="pause" />
      </div>
    </template>
  </wrapper>
</template>

<script>
import _ from 'lodash'
import store from 'store2'
import ACTIONS from '@/store/action-types'
import MUTATIONS from '@/store/mutations-types.js'
import LogItem from '@/components/LogItem'
import RangeDateTimePicker from '@/components/RangeDateTimePicker'
import DateTimePattern from '@/components/DateTimePattern'
import DateTimeRegexp from '@/components/DateTimeRegexp'
import Wrapper from '@/components/WrapperTable'
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
    if (this.pausedTimer) {
      clearInterval(this.pausedTimer)
    }
    clearInterval(this.buffer.timer)
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
      buffer: {
        maxlen: 10000,
        data: [],
        timer: setInterval(() => this.flushLive(), 200)
      },
      stats: [],
      loading: true,
      deepLoading: false,
      placeholderRe: ''
    }
  },
  watch: {
    //
  },
  computed: {
    ...mapState(['user', 'dashboards', 'sock', 'theme', 'orient', 'direction']),
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
    onHover(value) {
      if ('pattern' in value) {
        this.placeholderRe = value.pattern
      }
    },
    onTag(value) {
      console.log('onTag', value)
      if (value.pattern) {
        if (this.$refs['date-time-pattern']) {
          const $pattern = this.$refs['date-time-pattern'].$el.firstChild
          $pattern.value = value.pattern
          $pattern.dispatchEvent(new Event('change', { bubbles: true }))
        }
        if (this.$refs['date-time-regexp']) {
          const $regexp = this.$refs['date-time-regexp'].$el.firstChild
          $regexp.value = value.pattern
          $regexp.dispatchEvent(new Event('change', { bubbles: true }))
          $regexp.focus()
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
        .concat(['', ''])
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
      this.buffer.data.push(data.payload)
    },
    flushLive() {
      const { maxlen } = this.buffer
      if (this.buffer.data.length > 0) {
        const { live } = this.logs
        let chunk = this.buffer.data.splice(0)
        chunk = _.sortBy(chunk, 'timestamp')
        console.log(chunk.length)
        live.push(...chunk)
        if (live.length > maxlen) {
          live.splice(0, live.length - maxlen)
        }
      }
    },
    async onMore(e) {
      console.log('onMore', e)
      this.deepLoading = true
      const logs = await this.$store.dispatch(ACTIONS.LOAD_LOGS, {
        ...this.filters,
        dash_id: this.dash.id,
        sock_id: this.sock.id,
        offset: this.offset
      })
      this.deepLoading = false
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
        this.buffer.data.push(hr)
        this.flushLive()
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
      if (query.timestamp[0] === '' && query.timestamp[1] === '') {
        delete query.timestamp
      }
      query = _.pickBy(query)
      this.$router.replace({ query })
    },
    async updateLogs() {
      this.loading = true
      this.buffer.data = []
      this.logs.live = []
      this.logs.deep = []
      try {
        this.logs.history = await this.$store.dispatch(ACTIONS.LOAD_LOGS, {
          ...this.filters,
          dash_id: this.dash.id,
          sock_id: this.sock.id
        })
      } catch (e) {
        console.error(e.response)
        this.logs.history = []
      }
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
      this.$store.commit(MUTATIONS.SWITCH_THEME)
    },
    switchOrient() {
      this.$store.commit(MUTATIONS.SWITCH_ORIENT)
    },
    switchDirection() {
      this.$store.commit(MUTATIONS.SWITCH_DIRECTION)
    }
  }
}
</script>

<style lang="scss" scoped>
select#filter-level {
  width: 80px;
}
select#filter-version {
  width: 90px;
  float: right;
}
input#filter-limit {
  width: 60px;
}

.block {
  position: relative;
  padding: 0;
  margin: 0;
  border: dashed 0 grey;
  &.block-live {
    //
  }
  &.block-history {
    opacity: 0.8;
  }
  &.block-deep {
    opacity: 0.7;
    margin: 5px 0;
  }
  &.dashed {
    border-width: 1px 0 0 0;
    &.reverse {
      border-width: 0 0 1px 0;
    }
  }
  &.reverse {
    display: flex;
    flex-direction: column-reverse;
  }
  .cnt {
    display: none;
    position: absolute;
    top: -1px;
    right: 0;
    color: #fff;
    font-size: 10px;
    background-color: #888;
    padding: 2px 4px;
    border-radius: 0 0 3px 3px;
    margin-right: 5px;
    small {
      display: none;
    }
  }
}

.more {
  box-sizing: border-box;
  width: 190px;
  height: 25px;
  line-height: 25px;
  vertical-align: middle;
  display: inline-block;
  margin: 5px 0;
  text-align: center;
  padding: 0 5px;
  background-color: green;
  color: white;
  border-radius: 2px;
  opacity: 0.8;
  cursor: pointer;
  &:hover {
    opacity: 1;
  }
}
.pause {
  position: absolute;
  z-index: 900;
  left: -190px;
  bottom: 50px;
  width: 180px;
  height: 40px;
  line-height: 40px;
  font-size: 20px;
  color: white;
  text-align: center;
  border-radius: 3px;
  background-color: #aaa;
  border: solid 1px rgba(0, 0, 0, 0.2);
  opacity: 0.9;
  cursor: pointer;
  box-sizing: border-box;
  &:hover {
    opacity: 1;
  }
  &.pause-on {
    opacity: 1;
    background-color: #088;
  }
}

.fullscreen {
  .pause {
    width: 25px;
    left: -2px;
    font-size: 14px;
    border: none;
    background-color: rgba(128, 128, 128, 0.6);
    &.pause-on {
      background-color: #088;
    }
  }
}

.head-orient {
  .pause {
    border-radius: 3px 3px 0 0;
    height: 40px;
    line-height: 40px;
    top: -40px;
    right: 15px;
    left: auto;
    width: 55px;
  }
  /*@media screen and (max-width: 600px) {*/
  /*  .pause {*/
  /*    width: 55px;*/
  /*  }*/
  /*}*/
  &.fullscreen {
    .pause {
      width: 55px;
      top: 0;
      border-radius: 0 0 3px 3px;
      height: 25px;
      line-height: 25px;
    }
  }
}

.pause-line {
  position: relative;
  border-top: dashed 1px #088;
  span {
    position: absolute;
    top: -9px;
    right: 0;
    color: #fff;
    font-size: 10px;
    background-color: #088;
    border: solid 1px #066;
    padding: 1px 4px;
    border-radius: 3px;
    margin-right: 5px;
  }
}
</style>
