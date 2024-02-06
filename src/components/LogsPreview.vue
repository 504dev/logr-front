<template>
  <span class="preview">
    <log-item :preview="true" v-for="({ timestamp, level, message }, i) of randomStat" :key="i" :value="{
      timestamp,
      message,
      level
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
            timestamp: (Date.now() - (i * 123_456)) * 1e6,
            message: new Date().toISOString(),
            level: 'warn',
          })
        }
        return result
      }
      const result = _sortBy(this.stats, 'cnt').reverse().slice(0, this.n)
      const sampler = this.probabilitySample(result, 'cnt', Math.cbrt)
      for (let i = result.length; i <= this.n; i++) {
        result.push(sampler())
      }
      return result.map(({ logname, level, message, updated, cnt }) => ({
        timestamp: updated,
        message: `[${logname} / ${cnt}] ${message.replaceAll(/\n/g, ' ') || new Date(updated / 1e6).toISOString()}`,
        level,
      }))
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
