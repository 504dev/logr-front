<template>
  <div class="wrapper">
    <input ref="regexp" type="text" :placeholder="`0000-00-00T00:00:00`" :value="value" @change="onChange" />
    <span class="icon" @click="onClear" v-if="value"><i class="fas fa-times-circle"></i></span>
  </div>
</template>

<script>
export default {
  props: {
    value: String
  },
  methods: {
    onClear() {
      if (this.value) {
        this.$emit('input', '')
        const target = this.$refs.regexp
        this.$el.dispatchEvent(new Event('change', { target, bubbles: true }))
      }
    },
    onChange(e) {
      this.$emit('input', e.target.value.trim())
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
