<template>
  <wrapper :loading="loading" :class="{ night: !theme, reverse: !direction }">
    <template v-slot:goto>
      <router-link :to="`/dashboard/${dash.id}/counts`" class="goto-charts">
        <span>go to charts</span>
        <div></div>
      </router-link>
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
          </option>
        </select
        ><select v-model="filters.version" id="filter-version" :class="{ selected: filters.version }">
          <option value="">Version</option>
          <template v-for="version in sortedVersions">
          <option v-if="version" :value="version" :key="version">
            {{ version }}
          </option></template></select
        ><select v-model="filters.level" id="filter-level" :class="{ selected: filters.level }">
          <option value="">Level</option>
          <option v-for="level in sortedLevels" :value="level" :key="level">
            {{ level }}
          </option></select
        ><input-x
          id="filter-message"
          v-model="filters.message"
          placeholder="Message"
          :class="{ selected: filters.message }"
          :x2="!orient"
        ></input-x
        ><input
          type="number"
          v-model="filters.pid"
          placeholder="Pid"
          id="filter-pid"
          maxlength="6"
          v-if="false"
        /><range-date-time-picker
          id="filter-timestamp"
          v-model="filters.timestamp"
          v-if="false"
        ></range-date-time-picker
        ><date-time-iso
          id="filter-iso"
          ref="date-time-iso"
          v-model="filters.timestamp"
          :class="{ selected: filters.timestamp.some(v => v) }"
          v-if="false"
      /><input-x
          id="filter-regexp"
          ref="date-time-regexp"
          v-model="filters.pattern"
          :class="{ selected: filters.pattern }"
          :placeholder="placeholderRe || `0000-00-00T00:00:00`"
        /><input
          type="text"
          v-model="filters.limit"
          placeholder="Limit"
          id="filter-limit"
          :class="{ selected: filters.limit }"
        /><button class="pause" :class="{ 'pause-on': paused }" @mouseup.prevent="onPause">
          <font-awesome-icon icon="pause" /> {{ paused ? 'paused' : 'pause' }}
        </button>
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
          <div v-if="log.hr" :key="key" class="separator" :class="{ 'separator-pause': log.timer }">
            <span><font-awesome-icon icon="pause" /> {{ log.text }}</span>
          </div>
          <log-item v-else :value="log" :filters="filters" :key="key" @tag="onTag" @hover="onHover" />
        </template>
      </div>
      <div class="block block-history" :class="{ reverse: !direction }">
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
      <div class="block block-deep" :class="{ reverse: !direction }" v-for="(deep, key) in logs.deep" :key="key">
        <log-item v-for="(log, key) in deep" :value="log" :filters="filters" :key="key" @tag="onTag" @hover="onHover" />
        <span class="cnt" :title="`${deep.length}rows`">{{ deep.length }}<small>.</small></span>
      </div>
      <div class="separator separator-nomore" v-if="nomore">
        <span>{{nomore}}</span>
      </div>
      <button class="more" @click="onMore" v-else>
        fetch more
        <spinner v-if="deepLoading" />
        <font-awesome-icon icon="chevron-circle-down" v-else />
      </button>
    </template>
  </wrapper>
</template>

<script>
import _get from 'lodash/get'
import _map from 'lodash/map'
import _last from 'lodash/last'
import _first from 'lodash/first'
import _sumBy from 'lodash/sumBy'
import _sortBy from 'lodash/sortBy'
import _pickBy from 'lodash/pickBy'
import _groupBy from 'lodash/groupBy'
import store from 'store2'
import ACTIONS from '@/store/action-types'
import MUTATIONS from '@/store/mutations-types'
import LogItem from '@/components/LogItem.vue'
import RangeDateTimePicker from '@/components/RangeDateTimePicker.vue'
import DateTimeIso from '@/components/DateTimeIso.vue'
import Wrapper from '@/components/WrapperTable.vue'
import InputX from '@/components/InputX.vue'
import Spinner from '@/components/Spinner.vue'
import { mapState } from 'vuex'

const ls = store.namespace('logs')

export default {
  components: {
    Wrapper,
    LogItem,
    RangeDateTimePicker,
    DateTimeIso,
    InputX,
    Spinner
  },
  async created() {
    await Promise.all([
      this.$store.dispatch(ACTIONS.WS_CONNECT),
      this.$store.dispatch(ACTIONS.LOAD_ME),
      this.$store.dispatch(ACTIONS.LOAD_DASHBOARDS)
    ])

    this.lognames = await this.$store.dispatch(ACTIONS.LOAD_LOGS_LOGNAMES, this.dash.id)
    this.parseLocation()
    this.updateLocation()

    await this.$store.dispatch(ACTIONS.PAUSE_LOGS, this.paused)
    this.sock.on('/log', this.logHandler)

    await this.updateLogs()
  },
  destroyed() {
    this.sock.unsubscribe('/log', this.logHandler)
    if (this.pausedLine) {
      clearInterval(this.pausedLine.timer)
    }
    clearInterval(this.buffer.timer)
  },
  data() {
    return {
      paused: false,
      pausedLine: null,
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
      lognames: [],
      loading: true,
      deepLoading: false,
      placeholderRe: '',
      updateTs: 0
    }
  },
  watch: {
    ['filters.logname'](v, prev) {
      document.title = this.dash.name + ' • ' + v
      if (prev !== '') {
        Object.assign(this.filters, {
          hostname: '',
          level: '',
          version: '',
          message: ''
        })
      }
      this.updateStats()
    }
  },
  computed: {
    ...mapState(['user', 'dashboards', 'sock', 'theme', 'orient', 'direction']),
    dash() {
      return (this.dashboards || []).find(dash => dash.id === +this.$route.params.id)
    },
    sortedLognames() {
      const grouped = _groupBy(this.lognames, 'logname')
      const mapped = _map(grouped, (group, logname) => {
        const cnt = _sumBy(group, 'cnt')
        return { logname, cnt }
      })
      const sorted = _sortBy(mapped, 'cnt').reverse()
      return _map(sorted, 'logname')
    },
    sortedHostnames() {
      return this.groupStatsBy('hostname')
    },
    sortedLevels() {
      return this.groupStatsBy('level')
    },
    sortedVersions() {
      return this.groupStatsBy('version', 'updated').slice(0, 10)
    },
    lastPack() {
      return _last(this.logs.deep) || this.logs.history
    },
    offset() {
      return _get(_last(this.lastPack), 'timestamp')
    },
    nomore() {
      if (this.lastPack.length === 0) {
        return 'fetched all'
      }
      if (this.lastPack.length < +this.filters.limit) {
        return 'fetched all'
      }
      return false
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
        if (this.$refs['date-time-iso']) {
          const $iso = this.$refs['date-time-iso'].$el.firstChild
          $iso.value = value.pattern
          $iso.dispatchEvent(new Event('change', { bubbles: true }))
        }
        if (this.$refs['date-time-regexp']) {
          this.filters.pattern = value.pattern
          this.placeholderRe = ''
          this.onChangeFilters()
          this.$refs['date-time-regexp'].$el.querySelector('input').focus()
        }
        return
      }
      if (value.level && value.level === this.filters.level) {
        value.level = null
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
        logname = ls.get(`dash${this.dash.id}.filters.logname`)
        logname = this.sortedLognames.includes(logname) ? logname : _first(this.sortedLognames) || ''
      }
      timestamp = []
        .concat(timestamp)
        .concat(['', ''])
        .slice(0, 2)

      this.paused = parseInt(paused) || 0
      this.filters = {
        logname,
        hostname,
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
        chunk = _sortBy(chunk, 'timestamp')
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
      if (this.pausedLine) {
        clearInterval(this.pausedLine.timer)
        delete this.pausedLine.timer
        this.pausedLine.text = this.pausedLine.text.slice(0, 5)
      }
      if (this.paused) {
        this.forcePause()
      }
    },
    forcePause() {
      const hr = {
        hr: true,
        timestamp: Date.now(),
        text: '00:00',
        timer: setInterval(() => {
          hr.text = new Date(Date.now() - hr.timestamp).toISOString().slice(14, 19) //21)
        }, 100)
      }
      this.pausedLine = hr
      this.buffer.data.push(hr)
      this.flushLive()
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
      query = _pickBy(query)
      this.$router.replace({ query })
    },
    async updateStats() {
      if (this.stats.length) {
        this.stats = []
      }
      this.stats = await this.$store.dispatch(ACTIONS.LOAD_LOGS_STATS, {
        dashId: this.dash.id,
        logname: this.filters.logname
      })
    },
    async updateLogs() {
      const updateTs = (this.updateTs = Date.now())
      this.loading = true
      this.buffer.data = []
      this.logs.live = []
      this.logs.deep = []
      try {
        const data = await this.$store.dispatch(ACTIONS.LOAD_LOGS, {
          ...this.filters,
          dash_id: this.dash.id,
          sock_id: this.sock.id
        })
        if (this.updateTs !== updateTs) {
          console.error('Different updateTs')
          return
        }
        this.logs.history = data
        if (this.paused) {
          this.forcePause()
        }
      } catch (e) {
        console.error(e.response)
        this.logs.history = []
      }
      this.loading = false
    },
    groupStatsBy(fieldname, sort = 'cnt') {
      const grouped = _groupBy(this.stats, fieldname)
      const mapped = _map(grouped, (group, key) => {
        const cnt = _sumBy(group, 'cnt')
        const updated = Math.max(..._map(group, 'updated'))
        return { [fieldname]: key, cnt, updated }
      })
      const sorted = _sortBy(mapped, v => -v[sort])
      return _map(sorted, fieldname)
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
  width: 85px;
}
select#filter-version {
  width: 85px;
  margin-right: 10px;
}
input#filter-limit {
  width: 55px;
  margin-right: 10px;
}

.block {
  position: relative;
  padding: 0;
  margin: 0;
  //border: dashed 0 grey;
  &.block-live {
    z-index: 100;
  }
  &.block-history {
    opacity: 0.8;
    z-index: 99;
  }
  &.block-deep {
    opacity: 0.8;
    //opacity: 0.7;
    //margin: 5px 0;
    z-index: 98;
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
  border-color: #111;
  color: #111;
  font-weight: bold;
  width: 180px;
  margin: 5px 0;
  /*background-color: #fb8;*/
  background-color: #5b5;
  opacity: 0.9;
  cursor: pointer;
  &:hover {
    opacity: 1;
  }
  &.no {
    background-color: #fff;
    pointer-events: none;
  }
}

.reverse {
  .more > svg {
    rotate: 180deg;
  }
}

.pause {
  cursor: pointer;
  width: 115px;
  background-color: #eee;
  border-color: black;
  svg {
    font-size: 12px;
  }
  &.pause-on {
    background-color: #088;
    border-color: #044;
    color: white;
  }
}

.separator {
  z-index: 999;
  position: relative;
  border-top: dashed 1px #000;
  margin: 4px 0;
  span {
    position: absolute;
    top: -9px;
    right: 51%;
    background-color: #000;
    color: #fff;
    outline: solid 4px #fff;
    border-radius: 3px;
    padding: 3px 4px;
    font-size: 10px;
    font-weight: bold;
  }
}
.night .separator {
  border-top: dashed 1px #fff;
  span {
    outline: solid 4px #000;
    background-color: #fff;
    color: #000;
  }
}
.separator.separator-pause {
  border-top: dashed 1px #088;
  span {
    //margin-right: -6px;
    background-color: #088;
  }
}
.separator.separator-nomore {
  z-index: 1;
  border-color: #777;
  //margin: 10px 0;
  span {
    background-color: #777;
    outline: none;
    display: none;
  }
}

.goto-charts {
  display: inline-block;
  text-align: center;
  text-decoration: none;
  > div {
    width: 60px;
    height: 35px;
    background: #333;
    background-image: url('/static/counts.jpg');
    background-size: 80px;
    background-position-y: -22px;
    background-position-x: 75px;
    border-radius: 2px;
    outline: solid 1px #000;
    //border-bottom: solid 1px #000;
    box-sizing: border-box;
    opacity: 0.9;
  }
  > span {
    display: none; // off
    font-size: 11px;
    visibility: hidden;
  }
  &:hover {
    > div {
      opacity: 1;
    }
    > span {
      visibility: visible;
    }
  }
}

</style>
