<template>
  <div class="center" v-if="globals">
    <form :action="setupUrl()" method="post" v-if="globals.setup" ref="setup">
      <input type="hidden" name="manifest" id="manifest" :value="manifest" /><br />
      <a href="#" @click.prevent="$refs.setup.submit()" class="zoom">Create a GitHub App</a>
    </form>
    <template v-else>
      <p><a :href="loginUrl()" class="zoom">Sign in</a></p>
      <template v-if="loginers.length">
        <p v-for="info in loginers" :key="info.username">
          <a :href="loginUrl({ login: info.username })">
            by <img class="avatar" :src="`https://avatars.githubusercontent.com/u/${info.github_id}`" />
            {{ info.username }}
          </a>
        </p>
      </template>
    </template>
  </div>
</template>

<script>
import _ from 'lodash'
import qs from 'querystring'
import store from 'store2'
import { mapGetters, mapState } from 'vuex'
import ACTIONS from '../store/action-types'

const ls = store.namespace('login.loginers')

export default {
  async created() {
    await this.$store.dispatch(ACTIONS.LOAD_GLOBALS)
  },
  computed: {
    ...mapGetters(['restUrl']),
    ...mapState(['globals']),
    loginers() {
      const res = {}
      ls.each((username, info) => (res[username] = info))
      return _.sortBy(res, info => -info.login_at)
    },
    name() {
      const id = Math.random()
        .toString(36)
        .substring(2, 6)
      return `logr-auth-app-${id}`
    },
    manifest() {
      return JSON.stringify({
        name: this.name,
        url: location.origin,
        description: 'logger',
        redirect_url: `${this.restUrl}/oauth/setup/callback`,
        callback_url: `${this.restUrl}/oauth/authorize/callback`
      })
    }
  },
  methods: {
    setupUrl() {
      const callback = `${location.origin}/login`
      return `${this.restUrl}/oauth/setup?${qs.stringify({ callback })}`
    },
    loginUrl(query = {}) {
      const callback = `${location.origin}/jwt/`
      query = { ...query, callback }
      return `${this.restUrl}/oauth/authorize?${qs.stringify(query)}`
    }
  }
}
</script>

<style scoped lang="scss">
a {
  color: #111111;
}
.center {
  white-space: nowrap;
  position: relative;
  display: block;
  width: 100px;
  margin: auto;
  top: 45%;
  text-align: left;
}
.zoom {
  zoom: 1.5;
}
.avatar {
  width: 16px;
  height: 16px;
  border-radius: 16px;
}
</style>
