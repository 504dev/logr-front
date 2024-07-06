<template>
  <span class="wrapper" :class="{ x2 }">
    <input
      type="text"
      :placeholder="placeholder"
      :value="modelValue"
      @input="onInput"
    />
    <span class="icon" @click="onClear" v-if="modelValue">
      <FontAwesomeIcon icon="times-circle"/>
    </span>
  </span>
</template>

<script>
import { defineComponent } from 'vue'

export default defineComponent({
  props: {
    modelValue: String,
    placeholder: String,
    x2: { type: Boolean, default: false }
  },
  emits: ['update:modelValue'],
  methods: {
    onInput(e) {
      this.$emit('update:modelValue', e.target.value.trim())
    },
    onClear() {
      if (this.modelValue) {
        this.$emit('update:modelValue', '')
        const target = this.$el.querySelector('input')
        target.dispatchEvent(new Event('change', { bubbles: true }))
        target.focus()
      }
    }
  }
})
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
