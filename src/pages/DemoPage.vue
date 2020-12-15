<template>
  <div class="container">
    <div class="title">
      <span class="logo">
        <img src="/static/logr.png" />
      </span>
      <a href="https://github.com/504dev/logr" class="github">
        <font-awesome-icon :icon="['fab', 'github']" />
      </a>
    </div>
    <div class="window" v-if="token">
      <iframe :src="url" @load="onLoad" ref="iframe"></iframe>
    </div>
  </div>
</template>

<script>
import ACTIONS from '../store/action-types'
export default {
  async mounted() {
    document.title = 'Demo'
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
  },
  methods: {
    async onLoad({ target }) {
      try {
        const { href } = target.contentWindow.location
        console.log({ href })
      } catch (err) {
        console.error(err)
        this.token = await this.$store.dispatch(ACTIONS.LOAD_FREE_TOKEN)
        target.src = this.url
      }
    }
  }
}
</script>

<style scoped lang="scss">
.container {
  box-sizing: border-box;
  position: absolute;
  padding: 130px 80px 40px 80px;
  height: 100%;
  width: 100%;
  bottom: 0;
}
@media screen and (max-width: 800px) {
  .container {
    padding: 120px 20px 20px 20px;
  }
}
@media screen and (max-width: 400px) {
  .container {
    padding: 120px 0 0 0;
  }
}
.window {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  border-radius: 4px;
  overflow: hidden;
  border: solid 1px black;
}
iframe {
  border: 0;
  height: 100%;
  width: 100%;
}
.title {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  text-align: center;
  font-size: 64px;
  line-height: 128px;
  font-weight: bold;
  letter-spacing: -5px;
  .logo {
    display: inline-block;
    vertical-align: top;
    width: 128px;
    height: 128px;
    overflow: hidden;
    img {
      width: 100%;
      height: 100%;
    }
  }
}
.github {
  /*zoom: 0.7;*/
  /*display: none;*/
}
</style>
