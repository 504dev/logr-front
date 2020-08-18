<template>
  <p class="error" v-if="error"><span>Error:</span> {{ error }}<br /></p>
</template>

<script>
import MUTATIONS from '../store/mutations-types'
import store from 'store2'
import { mapGetters } from 'vuex'

const ls = store.namespace('login.loginers')

export default {
  created() {
    if (this.error) {
      console.error(this.error)
      setTimeout(() => (location.href = '/login'), 3 * 1000)
      return
    }
    this.$store.commit(MUTATIONS.SET_JWT, this.token)
    ls.set(this.jwtPayload.username, {
      github_id: this.jwtPayload.github_id,
      username: this.jwtPayload.username,
      login_at: Date.now()
    })
    if (this.redirectUrl) {
      location.href = this.redirectUrl
      this.$store.commit(MUTATIONS.FLUSH_REDIRECT)
      return
    }
    this.$router.push('/')
  },
  computed: {
    ...mapGetters(['jwtPayload']),
    token() {
      return this.$route.params.token
    },
    redirectUrl() {
      return this.$route.query.redirect_url || this.$store.state.redirectUrl
    },
    error() {
      return this.token === 'error' && this.$route.query.msg
    }
  }
}
</script>
<style scoped lang="scss">
.error {
  position: relative;
  text-align: center;
  top: 45%;
  span {
    color: red;
  }
}
</style>
