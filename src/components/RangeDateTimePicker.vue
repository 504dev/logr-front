<template>
  <div>
    <date-time-picker :value="milliseconds[0]" @input="v => onInput(v, this.milliseconds[1])" />
    <date-time-picker :value="milliseconds[1]" @input="v => onInput(this.milliseconds[0], v)" />
  </div>
</template>

<script>
import DateTimePicker from './DateTimePicker.vue'

export default {
  props: {
    value: Array
  },
  components: { DateTimePicker },
  computed: {
    milliseconds() {
      return this.value.map(v => Math.round(v / 1e6))
    }
  },
  methods: {
    onInput(since, to) {
      this.$emit('input', [String(since * 1e6), String(to * 1e6)])
    }
  }
}
</script>
<style scoped></style>
