<template>
  <div class="center">
    <a :href="url">Sign in</a>
  </div>
</template>

<script>
export default {
  data () {
    return {
      url: `${process.env.VUE_APP_REST}/oauth/authorize`
    }
  }
}
</script>

<style scoped>
a {
  color: #111111;
}
.center {
  position: absolute;
  top: 50%;
  left: 50%;
}
</style>
