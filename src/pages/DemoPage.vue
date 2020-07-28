<template>
  <div>
    <h1>logr</h1>
    <div class="window" v-if="token">
      <iframe :src="url"></iframe>
    </div>
  </div>
</template>

<script>
import ACTIONS from '../store/action-types'
export default {
  async created() {
    this.token = await this.$store.dispatch(ACTIONS.LOAD_FREE_TOKEN)
  },
  data() {
    return {
      token: null
    }
  },
  computed: {
    url() {
      if (!this.token) {
        return null
      }
      const redirectUrl = encodeURIComponent('/dashboard/2/logs')
      return `/jwt/${this.token}?redirect_url=${redirectUrl}`
    }
  }
}
</script>

<style scoped lang="scss">
.window {
  position: relative;
  display: block;
  width: 1200px;
  height: 560px;
  margin: auto;
  border-radius: 4px;
  overflow: hidden;
  border: solid 1px black;
}
iframe {
  border: 0;
  height: 100%;
  width: 100%;
}
h1 {
  text-align: center;
  font-size: 64px;
}
</style>
