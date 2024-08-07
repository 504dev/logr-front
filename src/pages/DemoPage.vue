<template>
  <div class="container">

    <div class="title">
      <span class="logr">logr</span>
      <a href="https://github.com/504dev/logr" class="github">
        <FontAwesomeIcon :icon="['fab', 'github']" />
      </a>
      <a href="https://hub.docker.com/r/kozhurkin/logr" class="dockerhub">
        <FontAwesomeIcon :icon="['fab', 'docker']" />
      </a>
    </div>

    <div class="docker">
      <prism>{{ docker }}</prism>
      <copy-to-clipboard :text="docker" />
    </div>

    <template v-if="token">
    <div class="window">
      <iframe :src="url" @load="onLoad" ref="iframe"></iframe>
    </div>
    <div class="examples">
      <h2>Usage</h2>
      <code-examples :keys="keys" v-model="lang" />
      <div class="link" v-if="link">
        <a :href="link" target="_blank">{{ link }}</a>
      </div>
    </div>
    </template>

  </div>
</template>

<script>
import ACTIONS from '@/store/action-types'
import CodeExamples from '@/components/CodeExamples.vue'
import CopyToClipboard from '@/components/CopyToClipboard.vue'
import Prism from 'vue-prism-component'

export default {
  components: {
    CopyToClipboard,
    CodeExamples,
    Prism
  },
  async mounted() {
    document.title = 'Demo'
    this.token = await this.$store.dispatch(ACTIONS.LOAD_FREE_TOKEN)
  },
  data() {
    return {
      token: null,
      keys: {
        public_key: 'MDwwDQYJKoZIhvcNAQEBBQADKwAwKAIhAJs2zmsJINq=',
        private_key: 'MIGqAgEAAiEAmzbOawkg2p7waM0HXhNPQlIrSOeGEP5='
      },
      lang: 'javascript',
      docker: 'docker run -d -p 7776:7776/udp -p 7778:7778 --name logr kozhurkin/logr',
    }
  },
  computed: {
    url() {
      if (!this.token) {
        return null
      }
      const redirectUrl = encodeURIComponent('/dashboard/2/logs')
      return `/jwt/${this.token}?redirect_url=${redirectUrl}`
    },
    link() {
      return {
        javascript: 'https://github.com/504dev/logr-node-client',
        golang: 'https://github.com/504dev/logr-go-client',
        python: 'https://github.com/504dev/logr-python-client',
        php: 'https://github.com/504dev/logr-php-client'
      }[this.lang]
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

<style>
body {
  background-color: #f4f2f0;
}
</style>

<style scoped lang="scss">

.container {
  min-width: 540px;
  text-align: center;
  box-sizing: border-box;
  padding: 40px 80px;
  padding-top: 0;
  //border-top: solid 10px #eee;
}
@media screen and (max-width: 800px) {
  .container {
    padding: 20px 20px;
    padding-top: 0;
  }
}

.title {
  //display: inline-block;
  margin-right: 16px;
  font-size: 48px;
  line-height: 96px;
  .logr {
    font-family: Logr;
    font-size: 64px;
  }
  .github,
  .dockerhub {
    color: #551a8b;
  }
}

.docker {
  display: inline-block;
  position: relative;
  font-size: 13px;
  font-weight: bold;
  //outline: dashed 1px #000;
  //zoom: 0.75;
  > pre {
    background-color: #e4e2e0;
    text-align: center;
    border-radius: 8px;
    margin: 0;
    padding: 16px;
    padding-right: 50px;
  }
  > svg {
    font-size: 14px;
    position: absolute;
    padding: 12px;
    right: 8px;
    top: 7px;
  }
}

.window {
  background-color: #fff;
  display: inline-block;
  box-sizing: border-box;
  width: 100%;
  max-width: 1280px;
  height: 570px;
  border-radius: 4px;
  overflow: hidden;
  border: solid 1px black;
  margin-bottom: 40px;
  margin-top: 16px;
  box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.5);
  iframe {
    border: 0;
    height: 100%;
    width: 100%;
  }
}
.examples {
  h2 {
    font-family: monospace;
    text-align: center;
    margin-bottom: -28px;
  }
  display: inline-block;
  width: 100%;
  max-width: 560px;
  text-align: right;
  .link a {
    font-size: 10px;
    color: black;
  }
}
</style>
