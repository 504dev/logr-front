<template>
  <span class="log-item" :class="{ preview }">

    <template v-if="preview">
      <span class="log-datetime"
      ><span class="date">{{ date }}</span><span class="separator"
      >T</span
      ><span class="time">{{ time }}</span><small>.{{ msec }}</small
      ></span>
      <span class="log-level ellipsis" :class="`log-level-${value.level}`">{{ value.level }}</span>
      <span class="log-message">{{value.message}}</span>
    </template>

    <template v-else>
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
      ><span
        class="date"
        @click="$emit('tag', { pattern: date })"
        @mouseover="$emit('hover', { pattern: date })"
        @mouseleave="$emit('hover', { pattern: '' })"
        >{{ date }}</span
      ><span class="separator">T</span
      ><span
        class="time"
        @click="$emit('tag', { pattern: datetime })"
        @mouseover="$emit('hover', { pattern: datetime })"
        @mouseleave="$emit('hover', { pattern: '' })"
        >{{ time }}</span
      ><small>.{{ msec }}</small></span
    >
    <span
      class="log-level ellipsis"
      :class="[`log-level-${value.level}`]"
      @click="$emit('tag', { level: $attrs.filters.level === value.level ? '' : value.level })"
      >{{ value.level }}</span
    >
    <log-item-msg
      :value="value.message"
      :filter="$attrs.filters.message"
      :timestamp="value.timestamp"
      class="log-message"
    />
    </template>
  </span>

</template>

<script>
import LogItemMsg from '@/components/LogItemMsg.vue'

export default {
  components: {
    LogItemMsg
  },
  props: {
    value: Object,
    preview: {
      type: Boolean,
      default: false,
    }
  },
  computed: {
    formatted() {
      const iso = new Date(this.value.timestamp / 1e6).toISOString()
      return [iso.slice(0, 10), iso.slice(11, 19), iso.slice(20, 23)]
    },
    date() {
      return this.formatted[0]
    },
    time() {
      return this.formatted[1]
    },
    datetime() {
      return this.formatted.slice(0, 2).join('T')
    },
    msec() {
      return this.formatted[2]
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
  //color: #fff;
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
  &.preview {
    font-size: 6.4px;
    line-height: 6.6px;
    > .log-level {
      width: 25px;
      padding: 0;
    }
    > .log-datetime .separator {
      margin: 0 1px;
    }
  }
  line-height: 17px;
  display: block;
  white-space: nowrap;
  .log-datetime {
    .date:hover,
    .time:hover {
      cursor: pointer;
      //outline: solid 1px #777;
      outline: solid 1px currentColor;
      border-radius: 3px;
      padding-bottom: 1px;
    }
    .separator {
      color: #777;
      margin: 0 2px;
    }
    small {
      color: #777;
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
    outline-style: solid;
    outline-width: 0;
    border-radius: 3px;
    padding: 0 1px;
    &.log-level-emerg,
    &.log-level-emergency {
      color: darkred;
      outline-color: darkred;
    }
    &.log-level-alert {
      color: darkred;
      outline-color: darkred;
    }
    &.log-level-crit,
    &.log-level-critical {
      color: red;
      outline-color: red;
    }
    &.log-level-error {
      color: orangered;
      outline-color: orangered;
    }
    &.log-level-warn,
    &.log-level-warning {
      color: orange;
      outline-color: orange;
    }
    &.log-level-notice {
      color: gold;
      outline-color: gold;
    }
    &.log-level-info {
      color: green;
      outline-color: green;
    }
    &.log-level-debug {
      color: blue;
      outline-color: blue;
    }
    &:hover {
      cursor: pointer;
      outline-width: 1px;
    }
  }
}
</style>
