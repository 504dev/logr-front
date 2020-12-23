<template>
  <div class="container">
    <div class="title">
      <span class="logr">logr</span>
      <!--      <logo class="logo" />-->
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
import Logo from '../components/Logo'

export default {
  components: {
    Logo
  },
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
      const redirectUrl = encodeURIComponent(`${location.origin}/dashboard/2/logs`)
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
        // target.src = this.url
        console.log(this.token, this.url)
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
  line-height: 96px;
  /*font-weight: bold;*/
  .logr {
    font-family: Logr;
    font-size: 96px;
  }
  .logo {
    display: inline-block;
    vertical-align: top;
    width: 128px;
    height: 128px;
    overflow: hidden;
  }
  .github {
    color: #551a8b;
  }
}
</style>
