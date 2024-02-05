<template>
  <span class="preview">
    <log-item :preview="true" v-for="(item, i) of randomStat" :key="i" :value="{
      timestamp: item.updated,
      message: `[${item.logname} / ${item.cnt}] ${
        item.message.replaceAll(/\n/g, ' ') || new Date(item.updated / 1e6).toISOString()
      }`,
      level: item.level
    }"/>
  </span>
</template>

<script>
import _sortBy from 'lodash/sortBy';
import _sumBy from 'lodash/sumBy';
import LogItem from './LogItem.vue';

export default {
  components: {
    LogItem
  },
  props: {
    stats: Object,
    n: {
      type: Number,
      default: 12,
    }
  },
  computed: {
    randomStat() {
      if (!this.stats) {
        const result = []
        for (let i = 0; i < this.n; i++) {
          result.push({
            updated: (Date.now() - (i * 123 * 1_000)) * 1e6,
            level: 'warn',
            message: new Date().toISOString(),
            cnt: Math.random(),
            logname: 'log'
          })
        }
        return result
      }
      const size = this.n
      const result = _sortBy(this.stats, 'cnt').reverse().slice(0, size)
      const sampler = this.probabilitySample(result, 'cnt', Math.cbrt)
      for (let i = result.length; i <= size; i++) {
        result.push(sampler())
      }
      return result
    },
  },
  methods: {
    probabilitySample(data, field, func = v => v) {
      const list = data.map(payload => ({ payload, probability: func(payload[field]) }))
      const sum = _sumBy(list, 'probability')
      return () => {
        const rndi = Math.floor(Math.random() * sum)
        for (let i = 0, cum = 0; i < list.length; i++) {
          cum += list[i].probability
          if (rndi < cum) {
            return list[i].payload
          }
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.preview {
  display: block;
  font-family: Courier, monospace;
  pointer-events: none;
  > span {
    opacity: 0.5;
  }
}
</style>
