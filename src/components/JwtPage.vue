<template>
  <div></div>
</template>

<script>
import MUTATIONS from '../store/mutations-types'

export default {
  created () {
    this.$store.commit(MUTATIONS.SET_JWT, this.token)
    this.$router.push('/')
  },
  computed: {
    token () {
      return this.$route.params.token
    }
  }
}
</script>
