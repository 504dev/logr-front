<template>
  <div class="widget" v-if="expand && counts">
    <span @click="closeChart" class="label close"><font-awesome-icon icon="times"/></span
    ><counts-snippet-chart :subtitle="title" :series="series" class="chart" />
  </div>
  <span v-else-if="valid" @click="showChart" class="label open"><font-awesome-icon icon="chart-line"/> {{title}}</span>
  <span v-else class="label invalid" title="invalid widget"
  ><font-awesome-icon icon="exclamation-triangle"/> {{ JSON.stringify(this.$attrs) }}</span
  >
</template>

<script>
import CountsSnippetChart from './CountsSnippetChart.vue'
import ACTIONS from '@/store/action-types'
import { DEFAULT_COLOR } from '@/constants/colors'

export default {
  components: {
    CountsSnippetChart
  },
  props: {
    dashId: Number,
    logname: String,
    hostname: String,
    kind: String,
    keyname: String,
    timestamp: String,
    limit: Number
  },
  mounted() {
    console.log(this.$attrs, this.$props)
  },
  data() {
    return {
      expand: false,
      counts: null
    }
  },
  computed: {
    title() {
      return this.kind + ':' + this.keyname
    },
    valid() {
      return this.dashId && this.logname && this.hostname && this.kind && this.keyname && this.timestamp
    },
    series() {
      if (!this.counts) {
        return null
      }
      const data = this.counts.data.map(([x, y]) => [x * 1000, y])
      return [
        {
          name: this.keyname,
          data,
          color: DEFAULT_COLOR
        }
      ]
    }
  },
  methods: {
    closeChart() {
      console.log('closeChart')
      this.expand = false
    },
    async showChart() {
      console.log('showChart')
      this.expand = true
      const payload = {
        dash_id: this.dashId,
        timestamp: Math.round(this.timestamp / 1e9),
        logname: this.logname,
        hostname: this.hostname,
        keyname: this.keyname,
        kind: this.kind,
        limit: this.limit || 15
      }
      console.log({ payload })
      this.counts = this.counts || (await this.$store.dispatch(ACTIONS.LOAD_COUNTS_SNIPPET, payload))
    }
  }
}
</script>
<style lang="scss" scoped>
.widget {
  display: inline-block;
  vertical-align: text-top;
  .chart {
    display: inline-block;
    width: 360px;
    height: 200px;
    border-radius: 5px;
    border: solid 2px #434348;
  }
}
.label {
  padding: 2px 5px;
  border-radius: 2px;
  &.open {
    cursor: pointer;
    background-color: #9e9;
    color: #000;
    &:hover {
      background-color: rgba(160, 160, 160, 0.7);
    }
  }
  &.close {
    cursor: pointer;
    vertical-align: top;
    margin-right: 2px;
  }
  &.invalid {
    cursor: initial;
    background-color: tomato;
  }
}
</style>
