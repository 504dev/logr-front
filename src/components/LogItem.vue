<template>
  <span class="log-item">
    <span class="log-logname ellipsis tag" :title="value.logname" v-show="!$attrs.filters.logname">{{ value.logname }}</span>
    <span class="log-hostname ellipsis tag" :title="value.hostname" v-show="!$attrs.filters.hostname">{{
      value.hostname
    }}</span>
    <span class="log-time">{{ new Date(value.timestamp / 1000000).toISOString() }}</span>
    <span class="log-level ellipsis" :class="`log-level-${value.level}`">{{ value.level }}</span>
    <log-item-msg :value="value.message" :filter="$attrs.filters.message" class="log-message" />
  </span>
</template>

<script>
import LogItemMsg from './LogItemMsg'

export default {
  components: {
    LogItemMsg
  },
  props: {
    value: Object
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
  font-size: 10px;
  line-height: 16px;
  display: inline-block;
  /*margin: 0 5px;*/
  padding: 0 5px;
  background-color: #eeeeee;
  border-radius: 4px;
}
.log-item {
  display: block;
  white-space: nowrap;
}
.log-time {
  color: #bbbbbb;
}
.log-level {
  color: green;
  width: 50px;
}
.log-level-info {
  color: green;
}
.log-level-error {
  color: red;
}
.log-level-warn {
  color: orange;
}
.log-level-debug {
  color: blue;
}
.log-logname {
  width: 80px;
}
.log-hostname {
  width: 80px;
}
.log-message {
  white-space: pre;
}
</style>
