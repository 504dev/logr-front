<template>
  <span v-if="!valid" class="label invalid" title="invalid widget"
  ><font-awesome-icon icon="exclamation-triangle"/> {{ JSON.stringify(this.$attrs) }}</span>
  <div class="widget" v-else>
    <span @click="expanded ? hideChart() : showChart()" class="label" :class="expanded ? 'close' : 'open'"
    ><font-awesome-icon :icon="expanded ? 'times' : 'chart-line'"/> {{title}}</span
    ><counts-snippet-chart v-if="expanded && counts" :subtitle="title" :series="series" class="chart" />
  </div>
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
      expanded: false,
      counts: null
    }
  },
  computed: {
    title() {
      return this.kind + ':' + this.keyname
    },
    valid() {
      // TODO validateion error message
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
    hideChart() {
      this.expanded = false
    },
    async showChart() {
      this.expanded = true
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
      this.counts = this.counts || (await this.$store.dispatch(ACTIONS.LOAD_COUNTS_SNIPPET, payload)) || { data: [] }
    }
  }
}
</script>
<style lang="scss" scoped>
.widget {
  //outline: dotted 1px tomato;
  display: inline-block;
  position: relative;
  vertical-align: text-top;
  .chart {
    display: inline-block;
    position: absolute;
    left: 0;
    top: 18px;
    width: 100%;
    height: 200px;
    min-width: 360px;
    border-radius: 4px;
    border: solid 2px #9e9;
    border-top-left-radius: 0;
    box-shadow: 2px 2px 0 0 black;
    z-index: 999;
    background: #fff;
  }
}
.label {
  padding: 2px 5px;
  border-radius: 2px;
  cursor: pointer;
  background-color: #9e9;
  color: #000;
  &.open {
    &:hover {
      background-color: rgba(160, 160, 160, 0.7);
    }
  }
  &.close {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    > svg {
      margin: 0 2px;
    }
  }
  &.invalid {
    cursor: initial;
    background-color: tomato;
  }
}
</style>
