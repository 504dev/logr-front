<template>
    <font-awesome-icon icon="cog" class="rotating" v-bind="$attrs"/>
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
  animation: rotating 0.75s linear infinite;
}
</style>
