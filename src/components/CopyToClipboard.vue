<template>
  <font-awesome-icon v-if="copied" class="copied" icon="check" />
  <font-awesome-icon v-else class="copy" icon="copy" @click="copyToClipboard" />
</template>

<script>

export default {
  props: {
    text: String
  },
  data() {
    return {
      copied: false
    }
  },
  methods: {
    copyToClipboard() {
      navigator.clipboard.writeText(this.text)
      this.copied = true;
      setTimeout(() => this.copied = false, 1000);
    },
  }
}
</script>

<style scoped lang="scss">
.copy {
  opacity: 0.1;
  cursor: pointer;
  color: #000;
  &:hover {
    opacity: 0.2;
  }
}
.copied {
  color: green;
  opacity: 0.5
}
</style>
