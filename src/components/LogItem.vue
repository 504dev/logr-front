<template>
  <span class="log-item">
    <span class="log-logname ellipsis tag">{{ value.logname }}</span>
    <span class="log-hostname ellipsis tag">{{ value.hostname }}</span>
    <span class="log-time">{{ new Date(value.timestamp / 1000000).toISOString() }}</span>
    <span class="log-level ellipsis">{{ value.level }}</span>
    <span class="log-message">
      <span v-for="(chunk, key) in colorMessage" :key="key" :style="chunk.css">{{ chunk.text }}</span>
    </span>
  </span>
</template>

<script>
import ansicolor from 'ansicolor'

export default {
  props: {
    value: Object
  },
  computed: {
    colorMessage () {
      return ansicolor.parse(this.value.message)
    }
  }
}
</script>

<style scoped>
  .ellipsis {
    display: inline-block;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .tag {
    display: inline-block;
    /*margin: 0 5px;*/
    padding: 0 5px;
    background-color: #eeeeee;
    border-radius: 2px;
  }
  .log-item {
    display: block;
    white-space: nowrap;
  }
  .log-time {
    color: #cccccc
  }
  .log-level {
    color: green;
    width: 50px;
  }
  .log-logname {
    width: 60px;
  }
  .log-hostname {
    width: 60px;
  }
  .log-message {
    white-space: pre;
  }
</style>
