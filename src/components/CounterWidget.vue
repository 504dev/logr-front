<template>
  <div class="widget" v-if="expand && counts">
    <counts-snippet-chart :subtitle="kind + ':' + keyname" :series="series" class="chart" /><span
      @click="closeChart"
      class="close"
      ><font-awesome-icon icon="times-circle"/></span>
  </div>
  <span v-else-if="valid" @click="showChart" class="label open"><font-awesome-icon icon="chart-line"/></span>
  <span v-else class="label invalid" title="invalid widget"
    ><font-awesome-icon icon="exclamation-triangle"/> {{ JSON.stringify(this.$attrs) }}</span
  >
</template>

<script>
import CountsSnippetChart from './CountsSnippetChart'
import ACTIONS from '../store/action-types'

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
  data() {
    return {
      expand: false,
      counts: null
    }
  },
  computed: {
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
          data
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
    height: 160px;
    border-radius: 5px;
    border: solid 1px #000;
  }
  .close {
    cursor: pointer;
    vertical-align: top;
    margin-left: 1px;
  }
}
.label {
  padding: 2px 5px;
  border-radius: 2px;
  &.open {
    cursor: pointer;
    background-color: rgba(160, 160, 160, 0.5);
    &:hover {
      background-color: rgba(160, 160, 160, 0.7);
    }
  }
  &.invalid {
    cursor: pointer;
    background-color: rgba(192, 64, 64, 0.5);
  }
}
</style>
