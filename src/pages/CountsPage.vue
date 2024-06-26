<template>
  <wrapper :loading="loading" :orient="orient">
    <template v-slot:goto>
      <router-link :to="`/dashboard/${dash.id}/logs`" class="goto-logs">
        <span>go to logs</span>
        <div><logs-preview :n="6"/></div>
      </router-link>
    </template>

    <template v-slot:filters>
      <form @submit.prevent>
        <select
          @change="onChangeLogname"
          v-model="filters.logname"
          id="filter-logname"
          :class="{ selected: filters.logname }"
        >
          <option value="" v-if="sortedLognames.length === 0">Logname</option>
          <option v-for="logname in sortedLognames" :value="logname" :key="logname">
            {{ logname }}
          </option>
        </select><select
          @change="onChangeFilters"
          v-model="filters.hostname"
          id="filter-hostname"
          :class="{ selected: filters.hostname }"
          v-if="sortedHostnames.length > 1 || filters.hostname"
        >
          <option value="">Hostname</option>
          <option v-for="hostname in sortedHostnames" :value="hostname" :key="hostname">
            {{ hostname }}
          </option>
        </select><select
          @change="onChangeFilters"
          v-model="filters.version"
          id="filter-version"
          :class="{ selected: filters.version }"
        >
          <option value="">Version</option>
          <template v-for="version in sortedVersions">
          <option v-if="version" :value="version" :key="version">
            {{ version }}
          </option>
          </template>
        </select><select
          @change="onChangeFilters"
          v-model="filters.agg"
          id="filter-agg"
          :class="{ selected: filters.agg }"
        >
          <option v-for="agg in ['m', '5m', 'h', 'd']" :value="agg" :key="agg">
            {{ agg }}
          </option>
        </select>
      </form>
    </template>

    <template v-slot:kinds v-if="!nodata">
      <div v-for="(group, kind) in keynames" :key="kind" class="kindblock">
        <div class="kindname">
          <a :href="`#${kind}`">{{ kind }}</a>
        </div>
        <div class="keynames">
          <div v-for="(names, prefix) in group" :key="prefix" style="margin-top: 5px">
            <div v-for="keyname in names" :key="keyname" class="keyname">
              <a :href="`#${kind}:${keyname}`">{{ keyname }}</a>
              <span v-for="({ point, name }) of getLastValue(kind, keyname) || {}"
                    :title="name"
                    :key="name"
                    class="lastval-mini black"
              >{{ nFormatter(point[1]) }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template v-slot:customs>
      <a href="#" @click.prevent="switchOrient"
        ><FontAwesomeIcon :icon="['far', 'window-maximize']" :rotation="orient ? '270' : null"
      /></a>
    </template>

    <template v-slot:content>
      <span v-if="nodata" class="nodata header">:no data</span>
      <div v-else>
        <div v-for="(group, kind) in charts" :key="kind" :id="`${kind}`">
          <div v-for="(series, keyname) in group" :key="keyname" :id="`${kind}:${keyname}`" class="block">
            <p class="header">
              <b>{{ kind }}:</b>{{ keyname }}
              <span v-for="({ point, name }) of getLastValue(kind, keyname)"
                :title="name"
                :key="name"
                class="lastval black"
              >{{ nFormatter(point[1]) }}</span>
            </p>
            <counts-chart :series="series" class="chart" :kind="kind" />
          </div>
        </div>
      </div>
    </template>
  </wrapper>
</template>

<script>
import _map from 'lodash/map'
import _pick from 'lodash/pick'
import _first from 'lodash/first'
import _maxBy from 'lodash/maxBy'
import _sumBy from 'lodash/sumBy'
import _keyBy from 'lodash/keyBy'
import _sortBy from 'lodash/sortBy'
import _pickBy from 'lodash/pickBy'
import _groupBy from 'lodash/groupBy'
import _findLast from 'lodash/findLast'
import _mapValues from 'lodash/mapValues'
import _zipObject from 'lodash/zipObject'
import store from 'store2'
import { mapGetters, mapState } from 'vuex'
import ACTIONS from '@/store/action-types'
import MUTATIONS from '@/store/mutations-types'
import CountsChart from '@/components/CountsChart.vue'
import Wrapper from '@/components/WrapperTable.vue'
import LogsPreview from '@/components/LogsPreview.vue'
import { COLORS } from '@/constants/colors'

const ls = store.namespace('counts')

const TIME = {}
TIME.MINUTE = 60 * 1000
TIME.HOUR = 60 * TIME.MINUTE
TIME.DAY = 24 * TIME.HOUR
TIME.YEAR = 366 * TIME.DAY

const DELTAS = {
  'm': [TIME.MINUTE, TIME.HOUR * 6],
  '5m': [TIME.MINUTE * 5, TIME.DAY],
  'h': [TIME.HOUR, TIME.DAY * 14],
  'd': [TIME.DAY, TIME.YEAR],
}

export default {
  components: {
    LogsPreview,
    CountsChart,
    Wrapper
  },
  async created() {
    await Promise.all([this.$store.dispatch(ACTIONS.LOAD_ME), this.$store.dispatch(ACTIONS.LOAD_DASHBOARDS)])
    this.lognames = await this.$store.dispatch(ACTIONS.LOAD_COUNTS_LOGNAMES, this.dash.id)

    this.parseLocation()
    await this.updateLocation()

    await this.updateCounts()

    this.scrollToHash()
  },
  data() {
    return {
      lognames: [],
      stats: [],
      filters: {
        hostname: '',
        logname: '',
        pid: '',
        version: '',
        agg: ''
      },
      loading: true,
      paused: false,
      counts: null
    }
  },
  watch: {
    ['filters.logname'](v, prev) {
      document.title = this.dash.name + ' • ' + v
      if (prev !== '') {
        Object.assign(this.filters, {
          hostname: '',
          version: ''
        })
      }
      this.updateStats()
    }
  },
  computed: {
    ...mapState(['user', 'dashboards', 'orient']),
    ...mapGetters(['filled', 'nFormatter']),
    dash() {
      return (this.dashboards || []).find(dash => dash.id === +this.$route.params.id)
    },
    sortedLognames() {
      return _map(_sortBy(this.lognames, 'cnt').reverse(), 'logname')
    },
    sortedHostnames() {
      return this.groupStatsBy('hostname', 'updated').slice(0, 20)
    },
    sortedVersions() {
      return this.groupStatsBy('version', 'updated')
    },
    keynames() {
      return _mapValues(this.charts, group => {
        return _groupBy(Object.keys(group), v => v.split(':')[0])
      })
    },
    charts() {
      if (!this.counts) {
        return {}
      }
      if (this.sortedHostnames.length === 0) {
        return {}
      }
      // const isMultiHost = _size(_keyBy(this.counts, 'hostname')) > 1
      // const colorsMap = _zipObject(Object.keys(_keyBy(this.counts)), COLORS)
      const colorsMap = _zipObject(this.sortedHostnames, COLORS)
      console.log(this.sortedHostnames, COLORS, colorsMap)

      const grouped = _pick(
        _groupBy(this.counts, 'kind'),
        ['inc', 'avg', 'max', 'min', 'per', 'time']
      )

      return _mapValues(grouped, group => {
        const sorted = _sortBy(group, 'keyname')
        const grouped = _groupBy(sorted, 'keyname')

        return _mapValues(grouped, group => {
          const indexed = _keyBy(group, 'hostname')
          const mapped = _map(indexed, ({ data }, hostname) => {
            data = data.map(([x, y]) => [x * 1000, y]).reverse()
            data = this.filled(data, ...DELTAS[this.filters.agg])
            // const color = !isMultiHost ? DEFAULT_COLOR : '#' + this.convertToHex(hostname).slice(0, 6)
            const color = colorsMap[hostname]
            return { name: hostname, data, color }
          })
          return _sortBy(mapped, 'name')
        })
      })
    },
    nodata() {
      return !this.counts
    },
    lastValueMap() {
      return _mapValues(this.charts, (keymap, kind) => {
        return _mapValues(keymap, hosts => {
          const candidates = _map(hosts, ({ name, data }) => {
            data = kind === 'inc' ? data.slice(0, -2) : data
            return {
              name,
              point: _findLast(data, ([, y]) => y != null)
            }
          })
          return [_maxBy(candidates, 'point.0')]
        })
      })
    },
  },
  methods: {
    getLastValue(kind, keyname) {
      return this.lastValueMap[kind][keyname]
    },
    scrollToHash(hash) {
      hash = (hash || location.hash).replace(/^#/, '')
      if (hash) {
        const $el = document.getElementById(hash)
        if ($el) {
          $el.scrollIntoView({
            behavior: 'smooth'
          })
          document.querySelector('.block').classList.remove('active')
          $el.classList.add('active')
        }
      }
    },
    parseLocation() {
      let { hostname = '', logname = '', pid = '', version = '', agg = 'm' } = this.$route.query
      if (logname === '') {
        logname = ls.get(`dash${this.dash.id}.filters.logname`)
        logname = this.sortedLognames.includes(logname) ? logname : _first(this.sortedLognames) || ''
      }
      this.filters = {
        logname,
        hostname,
        pid,
        version,
        agg
      }
    },
    convertToHex(str) {
      let hash = 0
      if (str.length === 0) {
        return ''
      }

      for (let i = 0; i < str.length; i++) {
        let char = str.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash = hash & hash // Convert to 32bit integer
      }

      return Math.abs(hash).toString(16)
    },
    async onChangeLogname(e) {
      location.hash = ''
      return this.onChangeFilters(e)
    },
    async onChangeFilters(e) {
      console.log('onChangeFilters', e)
      ls.set(`dash${this.dash.id}.filters.logname`, this.filters.logname)

      await this.updateCounts()
      await this.updateLocation()

      this.scrollToHash()
    },
    updateLocation() {
      let query = { ...this.filters }
      query = _pickBy(query)
      return this.$router.replace({ query, hash: location.hash }).catch(e => console.error(e.message))
    },
    async updateStats() {
      this.stats = []
      this.stats = await this.$store.dispatch(ACTIONS.LOAD_COUNTS_STATS, {
        dashId: this.dash.id,
        logname: this.filters.logname
      })
    },
    async updateCounts() {
      this.counts = null
      this.loading = true
      if (!this.filters.logname) {
        this.loading = false
        return
      }
      this.counts = await this.$store.dispatch(ACTIONS.LOAD_COUNTS, {
        ...this.filters,
        dash_id: this.dash.id
      })
      console.log('updateCounts', this.counts)
      this.loading = false
    },
    groupStatsBy(fieldname, sort = 'cnt') {
      if (this.stats.length === 0) {
        return []
      }
      const grouped = _groupBy(this.stats, fieldname)
      const mapped = _map(grouped, (group, key) => {
        const cnt = _sumBy(group, 'cnt')
        const updated = Math.max(..._map(group, 'updated'))
        return { [fieldname]: key, cnt, updated }
      })
      const sorted = _sortBy(mapped, v => -v[sort])
      return _map(sorted, fieldname)
    },
    switchOrient() {
      this.$store.commit(MUTATIONS.SWITCH_ORIENT)
    }
  }
}
</script>

<style lang="scss" scoped>
input#filter-pid {
  display: inline-block;
  width: 40%;
}
select#filter-version {
  display: inline-block;
  width: 85px;
}
select#filter-agg {
  display: inline-block;
  width: 70px;
  float: right;
}
.block {
  display: inline-block;
  width: 100%;
  min-width: 400px;
  border-bottom: dotted 2px #000;
  .header {
    font-size: 18px;
    margin-left: 8px;
    text-align: left;
    transition: all 0.5s linear;
  }
  .lastval {
    font-size: smaller;
    font-weight: bold;
    display: inline-block;
    background-color: #fff;
    color: #000;
    padding: 6px 12px;
    border-radius: 4px;
    margin: 0 16px;
    float: right;
    text-align: center;
    min-width: 20px;
    line-height: 8px;
    border: solid 2px #000;
    &.black {
      background-color: #333;
      color: #fff;
    }
    &.gray {
      background-color: #f4f2f0;
      border-color: #f4f2f0;
      color: #000;
    }
  }
  .chart {
    height: 240px;
    min-width: 360px;
  }
  &.active {
    .header {
      //color: red;
    }
  }
}

.keyname {
  position: relative;
  white-space: nowrap;
  border-bottom: dotted 1px #ccc;
  padding-right: 30px;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 300px;
  > a {
    padding-right: 20px;
  }
  .lastval-mini {
    position: absolute;
    right: 0;
    bottom: 0;
    font-size: 9px;
    padding: 1px 4px;
    border-radius: 3px;
    border: solid 1px #000;
    color: #000;
    text-align: center;
    min-width: 8px;
    &.black {
      background-color: #333;
      color: #fff;
      padding: 2px 5px;
      border: none;
    }
  }
}

.nodata {
  display: block;
  width: 100%;
  text-align: center;
  position: relative;
  top: 45%;
}

.goto-logs {
  display: inline-block;
  text-align: center;
  text-decoration: none;
  > div {
    overflow: hidden;
    width: 60px;
    height: 35px;
    background: #222;
    border-radius: 2px;
    //border: solid 1px #eee;
    outline: solid 1px #000;
    box-sizing: border-box;
    > span {
      color: #fff;
      margin-left: -52px;
    }
  }
  > span {
    display: none; // off
    font-size: 11px;
    visibility: hidden;
  }
  &:hover {
    > div {
      background: #000;
    }
    > span {
      visibility: visible;
    }
  }
}
</style>
