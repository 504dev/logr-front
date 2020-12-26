<template>
  <div class="container">
    <div class="title">
      <span class="logr">logr</span>
      <a href="https://github.com/504dev/logr" class="github">
        <font-awesome-icon :icon="['fab', 'github']" />
      </a>
    </div>
    <div class="window" v-if="token">
      <iframe :src="url" @load="onLoad" ref="iframe"></iframe>
    </div>
    <div class="examples">
      <h2>Examples</h2>
      <codes :keys="keys" />
    </div>
  </div>
</template>

<script>
import ACTIONS from '../store/action-types'
import Logo from '../components/Logo'
import Codes from '../components/Codes'

export default {
  components: {
    Logo,
    Codes
  },
  async mounted() {
    document.title = 'Demo'
    this.token = await this.$store.dispatch(ACTIONS.LOAD_FREE_TOKEN)
  },
  data() {
    return {
      token: null,
      keys: {
        public_key: 'PUBLIC_KEY',
        private_key: 'PRIVATE_KEY'
      }
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
  min-width: 540px;
  text-align: center;
  box-sizing: border-box;
  padding: 0 80px;
  padding-bottom: 40px;
  border-top: solid 10px #eee;
}
@media screen and (max-width: 800px) {
  .container {
    padding: 0 20px;
  }
}
@media screen and (max-width: 400px) {
  .container {
    padding: 0;
  }
}
.title {
  font-size: 64px;
  line-height: 150px;
  .logr {
    font-family: Logr;
    font-size: 96px;
  }
  .github {
    color: #551a8b;
  }
}
.window {
  display: inline-block;
  box-sizing: border-box;
  width: 100%;
  max-width: 1280px;
  height: 480px;
  border-radius: 4px;
  overflow: hidden;
  border: solid 1px black;
  margin-bottom: 40px;
  iframe {
    border: 0;
    height: 100%;
    width: 100%;
  }
}
.examples {
  h2 {
    text-align: center;
    margin-bottom: -28px;
  }
  display: inline-block;
  width: 540px;
  text-align: right;
}
</style>
