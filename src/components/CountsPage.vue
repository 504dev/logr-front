<template>
  <wrapper :loading="loading">
    <template v-slot:filters>
      <p>
        <router-link :to="`/dashboard/${dash.id}/logs`">switch to logs</router-link>
      </p>
      <form @change="onChangeFilters" @submit.prevent>
        <select v-model="filters.logname">
          <option value="">Any logname</option>
          <option v-for="logname in sortedLognames" :value="logname" :key="logname">
            {{ logname }}
          </option>
        </select>
        <select v-model="filters.hostname">
          <option value="">Any hostname</option>
          <option v-for="hostname in sortedHostnames" :value="hostname" :key="hostname">
            {{ hostname }}
          </option>
        </select>
        <input type="number" v-model="filters.pid" placeholder="Pid" id="filter-pid" maxlength="6" />
        <select v-model="filters.version" id="filter-version">
          <option value="">Any version</option>
          <option v-for="version in sortedVersions" :value="version" :key="version" v-if="version">
            {{ version }}
          </option>
        </select>
        <select v-model="filters.agg" id="filter-agg">
          <option v-for="agg in ['m', 'h', 'd']" :value="agg" :key="agg">
            {{ agg }}
          </option>
        </select>
        <p v-for="(group, kind) in charts" :key="kind">
          <strong>{{ kind }}</strong
          ><br />
          <span v-for="(series, keyname) in group" :key="keyname">
            <a :href="`#${keyname}`" class="keyname">{{ keyname }}</a
            ><br />
          </span>
        </p>
      </form>
    </template>

    <template v-slot:content>
      <span v-if="nodata">No data</span>
      <div v-else>
        <div v-for="(group, kind) in charts" :key="kind">
          <div v-for="(series, keyname) in group" :key="keyname">
            <p class="header"><a :name="keyname"><b>{{ kind }}:</b>{{ keyname }}</a></p>
            <counts-chart :series="series" class="chart" />
          </div>
        </div>
      </div>
    </template>
  </wrapper>
</template>

<script>
import _ from 'lodash'
import store from 'store2'
import ACTIONS from '../store/action-types'
import CountsChart from './CountsChart'
import Wrapper from './Wrapper'
import { mapState } from 'vuex'

const ls = store.namespace('counts')

export default {
  components: {
    CountsChart,
    Wrapper
  },
  async created() {
    await Promise.all([this.$store.dispatch(ACTIONS.LOAD_ME), this.$store.dispatch(ACTIONS.LOAD_DASHBOARDS)])
    this.stats = await this.$store.dispatch(ACTIONS.LOAD_COUNTS_STATS, this.dash.id)

    let { hostname = '', logname = '', pid = '', version = '', agg = 'm' } = this.$route.query
    if (logname === '') {
      logname = ls.get(`dash${this.dash.id}.filters.logname`) || _.first(this.sortedLognames) || ''
    }
    this.filters = {
      logname,
      hostname,
      pid,
      version,
      agg
    }
    this.updateLocation()

    await this.updateCounts()
  },
  data() {
    return {
      paused: false,
      filters: {
        hostname: '',
        logname: '',
        pid: '',
        version: ''
      },
      counts: null,
      stats: [],
      loading: true
    }
  },
  computed: {
    ...mapState(['user', 'dashboards']),
    dash() {
      return (this.dashboards || []).find(dash => dash.id === +this.$route.params.id)
    },
    sortedHostnames() {
      return this.groupStatsBy('hostname')
    },
    sortedLognames() {
      return this.groupStatsBy('logname')
    },
    sortedVersions() {
      return this.groupStatsBy('version', 'updated')
    },
    charts() {
      if (!this.counts) {
        return null
      }
      return _.chain(this.counts)
        .groupBy('kind')
        .pick(['inc', 'avg', 'max', 'min', 'per', 'time'])
        .mapValues(group => {
          return _.chain(group)
            .sortBy('keyname')
            .groupBy('keyname')
            .mapValues(group => {
              return _.chain(group)
                .keyBy('hostname')
                .map(({ data }, hostname) => {
                  data = this.filled(data.reverse()).map(([x, y]) => [x * 1000, y])
                  return { name: hostname, data }
                })
                .value()
            })
            .value()
        })
        .value()
    },
    nodata() {
      return _.size(this.charts) === 0
    }
  },
  methods: {
    filled(list) {
      if (list.length < 2) {
        return list
      }
      const filled = [] //list.slice(0, 1)
      const first = _.first(list)[0]
      const last = _.last(list)[0]
      const delta = {
        m: 60,
        h: 60 * 60,
        d: 60 * 60 * 24
      }[this.filters.agg]
      let i = 0
      for (let t = first; t <= last; t += delta) {
        if (t === list[i][0]) {
          filled.push(list[i])
          i++
        } else {
          filled.push([t, null])
        }
      }
      return filled
    },
    async onChangeFilters(e) {
      console.log('onChangeFilters', e)
      ls.set(`dash${this.dash.id}.filters.logname`, this.filters.logname)

      await this.updateCounts()
      this.updateLocation()
    },
    updateLocation() {
      let query = { ...this.filters }
      query = _.pickBy(query)
      this.$router.replace({ query })
    },
    async updateCounts() {
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
      return _.chain(this.stats)
        .filter({ dash_id: this.dash.id })
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
  width: 55%;
  float: right;
}
select#filter-agg {
  display: inline-block;
  width: 40%;
}
.chart {
  height: 320px;
  border-bottom: dashed 1px #000;
}
.header {
  font-size: 18px;
  margin-left: 8px;
}
a.keyname {
  text-decoration: none;
}
</style>
