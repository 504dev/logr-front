<template>
  <VueFinalModal
    v-bind="$attrs"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
  >
    <div class="modal-body">
      <p class="title">{{ dash.name }}</p>
      <code-examples :keys="dash.keys[0]" v-if="dash.keys" class="codes" />
    </div>
  </VueFinalModal>
</template>

<script>
import CodeExamples from '@/components/CodeExamples.vue'
import { VueFinalModal } from 'vue-final-modal';

export default {
  components: {
    CodeExamples,
    VueFinalModal,
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
