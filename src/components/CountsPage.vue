<template>
  <div class="wrapper" v-if="this.user && this.dash">
    <div class="lefter">
      <img class="avatar" :src="`https://avatars0.githubusercontent.com/u/${user.github_id}`">
      <h3><router-link to="/dashboards">..</router-link>/{{ dash.name }}</h3>
      <form class="filters" @change="onChangeFilters" @submit.prevent>
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
        <input type="number" v-model="filters.pid" placeholder="Pid" class="filter-pid" maxlength="6" />
        <select v-model="filters.version" class="filter-version">
          <option value="">Any version</option>
          <option v-for="{ version } in sortedVersions" :value="version" :key="version" v-if="version">
            {{ version }}
          </option>
        </select>
        <p v-for="(keys, prefix) in keynames" :key="prefix">
          <strong>{{prefix}}</strong><br>
          <span  v-for="key in keys" :key="key">
            <a :href="`#${key}`">{{key}}</a><br>
          </span>
        </p>
      </form>
    </div>
    <div class="container">
      <span v-if="loading">Loading...</span>
      <span v-else-if="nodata">No data</span>
      <div v-else>
        <div v-for="(series, keyname) in charts" :key="keyname">
          <a :name="keyname">
            <counts-chart :title="keyname" :series="series" />
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import store from 'store2'
import ACTIONS from '../store/action-types'
import CountsChart from './CountsChart'
import { mapState } from 'vuex'

const ls = store.namespace('counts')

export default {
  components: {
    CountsChart
  },
  async created () {
    await Promise.all([
      this.$store.dispatch(ACTIONS.LOAD_ME),
      this.$store.dispatch(ACTIONS.LOAD_DASHBOARDS)
    ])
    this.stats = await this.$store.dispatch(ACTIONS.LOAD_COUNTS_STATS, this.dashid)
    this.init()

    if (this.dashStats.length) {
      await this.updateCounts()
      console.log(this.charts)
    }
  },
  data () {
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
      loading: false
    }
  },
  computed: {
    ...mapState(['user', 'dashboards', 'sock']),
    dashid () {
      return +this.$route.params.id
    },
    dash () {
      return (this.dashboards || []).find(dash => dash.id === this.dashid)
    },
    sortedHostnames () {
      return this.groupStatsBy('hostname')
    },
    sortedLognames () {
      return this.groupStatsBy('logname')
    },
    sortedVersions () {
      return this.groupStatsBy('version', 'updated')
    },
    charts () {
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
    keynames () {
      const keys = _.keys(this.charts)
      return _.groupBy(keys, v => v.split(':')[0])
    },
    dashStats () {
      return _.filter(this.stats, { dash_id: this.dashid })
    },
    nodata () {
      return _.size(this.charts) === 0
    }
  },
  methods: {
    init () {
      let {
        hostname = '',
        logname = '',
        pid = '',
        version = ''
      } = this.$route.query
      if (logname === '') {
        logname = ls.get(`dash${this.dashid}.filters.logname`) || _.get(this.sortedLognames, '0.logname') || ''
      }
      this.filters = {
        logname,
        hostname,
        pid,
        version
      }
      this.updateLocation()
    },
    async onChangeFilters (e) {
      console.log('onChangeFilters', e)
      ls.set(`dash${this.dashid}.filters.logname`, this.filters.logname)

      await this.updateCounts()
      this.updateLocation()
    },
    updateLocation () {
      let query = { ...this.filters }
      query = _.pickBy(query)
      this.$router.replace({ query })
    },
    async updateCounts () {
      this.loading = true
      this.counts = await this.$store.dispatch(ACTIONS.LOAD_COUNTS, {
        ...this.filters,
        dash_id: this.dashid
      })
      console.log('updateCounts', this.counts)
      this.loading = false
    },
    groupStatsBy (fieldname, sort = 'cnt') {
      return _.chain(this.dashStats)
        .groupBy(fieldname)
        .map((group, key) => {
          const cnt = _.sumBy(group, 'cnt')
          const updated = _.chain(group).map('updated').max().value()
          return { [fieldname]: key, cnt, updated }
        })
        .sortBy(v => -v[sort])
        .value()
    }
  }
}
</script>

<style lang="scss" scoped>

  .lefter {
    position: fixed;
    padding: 10px;
    height: 100%;
    width: 200px;
    background-color: rgba(224, 224, 224, 0.9);
    z-index: 901;

    .avatar {
      width: 32px;
      height: 32px;
      border-radius: 16px;
    }

    .filters {
      margin-top: 20px;
      display: block;
      select, input {
        box-sizing: border-box;
        display: block;
        margin-bottom: 10px;
        width: 100%;
        height: 30px;
        padding: 0 10px;
        border: solid 1px #999;
      }
      input:focus {
        outline: none;
        border-bottom: solid 1px green;
      }
      input.filter-pid {
        display: inline-block;
        width: 40%;
      }
      select.filter-version {
        display: inline-block;
        width: 55%;
      }
    }
  }

  .container {
    font-family: Courier;
    font-size: 14px;
    position: absolute;
    height: 100%;
    width: calc(100% - 250px);
    padding: 10px 0 0 230px;
    overflow: scroll;
    z-index: 900;
  }
</style>
