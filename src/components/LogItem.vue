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
    <span class="log-datetime"
      ><span class="date" @click="$emit('tag', { timestamp: formatted[0] })">{{ formatted[0] }}</span
      ><span class="separator">T</span
      ><span class="time" @click="$emit('tag', { timestamp: formatted.slice(0, 2).join('T') })">{{ formatted[1] }}</span
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
      const iso = new Date(this.value.timestamp / 1e6).toISOString()
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
  padding: 0 4px;
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
  line-height: 17px;
  display: block;
  white-space: nowrap;
  .log-datetime {
    .date:hover,
    .time:hover {
      cursor: pointer;
      box-shadow: 0 0 0 1px #888;
      /*background-color: rgba(128, 128, 128, 0.2);*/
      border-radius: 3px;
      padding-bottom: 1px;
    }
    .separator,
    small {
      color: #888;
    }
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
  .log-level {
    vertical-align: bottom;
    text-align: center;
    color: grey;
    width: 60px;
    &.log-level-info {
      color: green;
    }
    &.log-level-error {
      color: red;
    }
    &.log-level-warn {
      color: orange;
    }
    &.log-level-debug {
      color: blue;
    }
    &:hover {
      cursor: pointer;
      background-color: rgba(128, 128, 128, 0.2);
      border-radius: 3px;
    }
  }
}
</style>
