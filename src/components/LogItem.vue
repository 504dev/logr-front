<template>
  <span class="log-item">
    <span
      class="log-logname ellipsis tag"
      @click="$emit('tag', { logname: value.logname })"
      :title="value.logname"
      v-show="!$attrs.filters.logname"
      >{{ value.logname }}</span
    >
    <span
      class="log-hostname ellipsis tag"
      @click="$emit('tag', { hostname: value.hostname })"
      :title="value.hostname"
      v-show="!$attrs.filters.hostname"
      >{{ value.hostname }}</span
    >
    <span class="log-time"
      ><span>{{ formatted[0] }}</span> <span>{{ formatted[1] }}</span
      ><small>.{{ formatted[2] }}</small></span
    >
    <span
      class="log-level ellipsis"
      :class="`log-level-${value.level}`"
      @click="$emit('tag', { level: value.level })"
      >{{ value.level }}</span
    >
    <log-item-msg
      :value="value.message"
      :filter="$attrs.filters.message"
      :timestamp="value.timestamp"
      class="log-message"
    />
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
  },
  computed: {
    formatted() {
      const iso = new Date(this.value.timestamp / 1000000).toISOString()
      return [iso.slice(0, 10), iso.slice(11, 19), iso.slice(20, 23)]
    }
  }
}
</script>

<style lang="scss" scoped>
.ellipsis {
  display: inline-block;
  text-overflow: ellipsis;
  overflow: hidden;
}
.tag {
  color: #fff;
  font-size: 10px;
  line-height: 16px;
  display: inline-block;
  padding: 0 5px;
  background-color: rgba(128, 128, 128, 0.5);
  border-radius: 2px;
  text-align: center;
  cursor: pointer;
  vertical-align: text-bottom;
  &:hover {
    background-color: rgba(128, 128, 128, 0.7);
  }
}
.log-item {
  display: block;
  white-space: nowrap;
}
.log-time {
  small {
    color: #888;
  }
}
.log-level {
  cursor: pointer;
  color: green;
  width: 60px;
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
