<template>
  <modal v-bind="$attrs" width="640" height="340">
    <div class="modal-body">
      <p class="title">{{ dash.name }}</p>
      <codes :keys="dash.keys[0]" v-if="dash.keys" class="codes" />
    </div>
  </modal>
</template>

<script>
import Codes from './Codes.vue'

export default {
  components: {
    Codes
  },
  props: {
    dash: Object
  }
}
</script>

<style lang="scss" scoped>
.modal-body {
  position: relative;
  padding: 10px;
  text-align: right;
  .title {
    font-weight: bold;
    text-align: left;
  }
  .codes {
    margin-top: -40px;
  }
}
</style>
