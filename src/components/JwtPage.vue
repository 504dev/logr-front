<template>
  <div></div>
</template>

<script>
export default {
  created () {
    localStorage.setItem('jwt', this.token)
    this.$router.push('/')
  },
  computed: {
    token () {
      return this.$route.params.token
    }
  }
}
</script>
