<template>
  <div>
    <date-time-picker v-model="nano[0]" @input="onInput" />
    <date-time-picker v-model="nano[1]" @input="onInput" />
  </div>
</template>

<script>
import DateTimePicker from './DateTimePicker'

export default {
  props: {
    value: Array
  },
  components: { DateTimePicker },
  data () {
    return {
      nano: this.value.map(v => Math.round(v / 1e6))
    }
  },
  methods: {
    onInput () {
      this.$emit('input', this.nano.map(v => v * 1e6))
    }
  }
}
</script>
<style scoped>

</style>
