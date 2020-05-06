<template>
  <div class="center">
    <a :href="url">Sign in</a>
  </div>
</template>

<script>
const qs = require('querystring')

export default {
  data () {
    const callback = `${location.origin}/jwt/`
    return {
      url: `${process.env.VUE_APP_REST}/oauth/authorize?${qs.stringify({ callback })}`
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
