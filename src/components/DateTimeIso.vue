<template>
  <div class="wrapper">
    <input
      ref="pattern"
      type="text"
      :placeholder="`0000-00-00 00:00:00`"
      :class="{ invalid: !isValid }"
      v-model="pattern"
      @change="onChange"
      maxlength="19"
    />
    <span class="icon" @click="onClear" v-if="pattern"><font-awesome-icon icon="times-circle"/></span>
  </div>
</template>

<script>
export default {
  props: {
    value: Array
  },
  watch: {
    value(v) {
      this.pattern = this.range2text(v)
    }
  },
  data() {
    const pattern = this.range2text(this.value)
    return { pattern }
  },
  computed: {
    isValid() {
      return !!this.text2range(this.pattern)
    }
  },
  methods: {
    onClear() {
      if (this.pattern) {
        this.$emit('input', ['', ''])
        const target = this.$refs.pattern
        this.$el.dispatchEvent(new Event('change', { target, bubbles: true }))
      }
    },
    onChange(e) {
      const timestamps = this.text2range(e.target.value)
      if (timestamps === null) {
        e.stopPropagation()
        return
      }
      this.$emit(
        'input',
        timestamps.map(v => String(v * 1e6))
      )
    },
    range2text(range) {
      const [a = 0, b = 0] = range
      const dtA = new Date(a / 1e6)
      const dtB = new Date(b / 1e6)
      if (isNaN(dtA.getTime())) {
        return ''
      }
      let text = dtA
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ')
      for (let i = text.length; i >= 7; i--) {
        const chunk = text.slice(0, i)
        const [since, to] = this.text2range(chunk)
        if (to === dtB.getTime()) {
          return chunk.trim()
        }
        // console.log(i, chunk, new Date(since).toISOString(), new Date(to).toISOString(), to === dtB.getTime())
      }
      return ''
    },
    text2range(text) {
      text = text.trim()
      if (text.length === 0) {
        return [0, 0]
      }
      if (text.length < 7) {
        return null
      }
      const pattern = '0000-00-00 00:00:00'
      let since = text + pattern.slice(text.length)
      since = since.replace(/-00/g, '-01')
      since = new Date(since.replace(' ', 'T') + 'Z')
      let to = new Date(since)
      switch (text.length) {
        case 19:
          to.setUTCSeconds(to.getUTCSeconds() + 1)
          break
        case 18:
          to.setUTCSeconds(to.getUTCSeconds() + 10)
          break
        case 17:
        case 16:
          to.setUTCMinutes(to.getUTCMinutes() + 1)
          break
        case 15:
          to.setUTCMinutes(to.getUTCMinutes() + 10)
          break
        case 14:
        case 13:
          to.setUTCHours(to.getUTCHours() + 1)
          break
        case 12:
          to.setUTCHours(to.getUTCHours() + (to.getUTCHours() === 20 ? 4 : 10))
          break
        case 11:
        case 10:
          to.setUTCDate(to.getUTCDate() + 1)
          break
        case 9:
          const m = to.getUTCMonth()
          to.setUTCDate(to.getUTCDate() + (to.getUTCDate() === 1 ? 9 : 10))
          if (m !== to.getUTCMonth()) {
            to.setUTCDate(1)
          }
          break
        case 8:
        case 7:
          to.setUTCMonth(to.getUTCMonth() + 1)
          break
      }
      if (isNaN(since.getTime())) {
        return null
      }
      return [since.getTime(), to.getTime()]
    }
  }
}
</script>
<style scoped lang="scss">
div.wrapper {
  box-sizing: border-box;
  position: relative;
  white-space: nowrap;
  height: 30px;
  padding: 0;
  margin: 2px 0;

  &.selected > input {
    border-color: black;
  }

  > input {
    box-sizing: border-box;
    display: inline-block;
    border: solid 1px #999;
    border-bottom-width: 2px;
    margin: 0;
    padding: 0 0 0 10px;
    height: 100%;
    width: 100%;
    border-radius: 4px;
    &:focus {
      outline: none;
      border-bottom: solid 2px green;
    }
    &.invalid,
    &.invalid:focus {
      border-bottom: solid 2px red;
    }
  }

  span.icon {
    position: absolute;
    top: 6px;
    right: 9px;
    display: inline-block;
    cursor: pointer;
    color: #333;
    &:hover {
      color: #000;
    }
  }
}
</style>
