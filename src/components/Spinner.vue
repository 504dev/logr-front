<template>
  <span class="spinner rotating">
    <font-awesome-icon icon="cog" v-bind="$attrs"/>
  </span>
</template>

<style scoped lang="scss">
@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
.rotating {
  animation: rotating 1s linear infinite;
}
.spinner {
  display: inline-block;
}
</style>
