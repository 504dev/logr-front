<template>
  <span class="wrapper" :class="{ x2 }">
    <input type="text" :placeholder="placeholder" :value="value" @input="e => $emit('input', e.target.value.trim())" />
    <span class="icon" @click="onClear" v-if="value"><font-awesome-icon icon="times-circle"/></span>
  </span>
</template>

<script>
export default {
  props: {
    value: String,
    placeholder: String,
    x2: { type: Boolean, default: false }
  },
  methods: {
    onClear() {
      if (this.value) {
        this.$emit('input', '')
        const target = this.$el.querySelector('input')
        this.$el.dispatchEvent(new Event('change', { target, bubbles: true }))
        target.focus()
      }
    }
  }
}
</script>
<style scoped lang="scss">
span.wrapper {
  display: inline-block;
  position: relative;

  input {
    padding-right: 26px;
  }

  span.icon {
    position: absolute;
    top: 6px;
    right: 9px;
    display: inline-block;
    cursor: pointer;
    color: #333;
    line-height: 0;
    &:hover {
      color: #000;
    }
  }

  &.selected {
    > input {
      border-color: black;
    }
  }

  &.x2 {
    > input {
      height: 50px;
      font-size: 20px;
    }
    > span.icon {
      top: 18px;
    }
  }
}
</style>
