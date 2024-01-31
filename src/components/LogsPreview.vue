<template>
  <span class="preview">
    <log-item v-for="(item, i) of randomStat" :key="i" :value="{
      timestamp: item.updated,
      message: `[${item.logname}, cnt=${item.cnt}, ${new Date(item.updated / 1e6).toISOString()}`,
      level: item.level
    }"/>
  </span>
</template>

<script>
import LogItem from './LogItem.vue';

export default {
  components: {
    LogItem
  },
  props: {
    stats: Object
  },
  computed: {
    randomStat() {
      return Array.from({ length: 11 }, () => {
        const rndi = Math.ceil(Math.random() * this.stats.length) - 1
        return this.stats[rndi]
      })
    },
  },
  mounted() {
    console.log(this.stats)
  }
}
</script>

<style lang="scss" scoped>
.preview {
  opacity: 0.5;
  line-height: 1.3;
  position: relative;
  top: -2px;
  left: -95px;
  font-family: Courier, monospace;
  pointer-events: none;
  zoom: 0.4;
}
</style>
