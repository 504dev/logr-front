<template>
  <div></div>
</template>

<script>
import MUTATIONS from '../store/mutations-types'
import store from 'store2'
import { mapGetters } from 'vuex'

const ls = store.namespace('login.loginers')

export default {
  created () {
    this.$store.commit(MUTATIONS.SET_JWT, this.token)
    ls.set(this.jwtPayload.username, {
      github_id: this.jwtPayload.github_id,
      username: this.jwtPayload.username,
      login_at: Date.now()
    })
    this.$router.push('/')
  },
  computed: {
    ...mapGetters(['jwtPayload']),
    token () {
      return this.$route.params.token
    }
  }
}
</script>
