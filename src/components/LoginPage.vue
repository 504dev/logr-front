<template>
  <div class="center loginers">
    <template v-if="loginers.length">
      <p v-for="info in loginers" :key="info.username">
        <a :href="url({ login: info.username })">
          Sign in <img class="avatar" :src="`https://avatars0.githubusercontent.com/u/${info.github_id}`"> {{info.username}}
        </a>
      </p>
    </template>
    <template v-else>
      <p>
        <a :href="url()">Sign in</a>
      </p>
    </template>
  </div>
</template>

<script>
import _ from 'lodash'
import store from 'store2'
const qs = require('querystring')
const ls = store.namespace('login.loginers')

export default {
  computed: {
    loginers () {
      const res = {}
      ls.each((username, info) => (res[username] = info))
      return _.sortBy(res, info => -info.login_at)
    }
  },
  methods: {
    url (query) {
      const callback = `${location.origin}/jwt/`
      return `${process.env.VUE_APP_REST}/oauth/authorize?${qs.stringify({ callback, ...query })}`
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
  margin: auto;
  width: 100%;
  top: 50%;
  text-align: center;
}
.center > p:first-child {
  zoom: 1.5;
}
.center > p:first-child > a {
  color: #111111;
}
.avatar {
  width: 16px;
  height: 16px;
  border-radius: 16px;
}
</style>
