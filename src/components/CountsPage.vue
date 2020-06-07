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
        <p v-for="(keys, prefix) in keynames" :key="prefix">
          <strong>{{ prefix }}</strong
          ><br />
          <span v-for="key in keys" :key="key">
            <a :href="`#${key}`">{{ key }}</a
            ><br />
          </span>
        </p>
      </form>
    </template>

    <template v-slot:content>
      <span v-if="nodata">No data</span>
      <div v-else>
        <div v-for="(series, keyname) in charts" :key="keyname">
          <a :name="keyname">
            <counts-chart :title="keyname" :series="series" />
          </a>
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

    let { hostname = '', logname = '', pid = '', version = '' } = this.$route.query
    if (logname === '') {
      logname = ls.get(`dash${this.dash.id}.filters.logname`) || _.first(this.sortedLognames) || ''
    }
    this.filters = {
      logname,
      hostname,
      pid,
      version
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
        .groupBy(({ keyname, type }) => `${type}:${keyname}`)
        .mapValues(group => {
          return _.chain(group)
            .keyBy(v => v.hostname)
            .map(({ data }, hostname) => {
              data = data.map(([x, y]) => [x * 1000, y]).reverse()
              return { name: hostname, data }
            })
            .value()
        })
        .value()
    },
    keynames() {
      const keys = _.keys(this.charts)
      return _.groupBy(keys, v => v.split(':')[0])
    },
    nodata() {
      return _.size(this.charts) === 0
    }
  },
  methods: {
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
}
</style>
