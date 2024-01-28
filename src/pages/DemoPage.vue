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
      <h2>Usage</h2>
      <codes :keys="keys" v-model="lang" />
      <div class="link" v-if="link">
        <a :href="link" target="_blank">{{ link }}</a>
      </div>
    </div>
  </div>
</template>

<script>
import ACTIONS from '../store/action-types'
import Codes from '../components/Codes'

export default {
  components: {
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
        public_key: 'MDwwDQYJKoZIhvcNAQEBBQADKwAwKAIhAJs2zmsJINqe2jNB14TT0JSK0jnhhD+XrX6EwNCM3aGHAgMBAAE=',
        private_key:
          'MIGqAgEAAiEAmzbOawkg2p7aM0HXhNPQlIrSOeGEP5etfoTA0IzdoYcCAwEAAQIhAJFeb02IKyEWjj5beEK+HELLO:)1m6jbjutLpGglUi8VkgLm3hAhEAxJMa7O8UJPrA0qzZdR+MswIRAMoiz+SgegcoRh+f5s3Fqd0CEFQPN+9j2TBrDjPI+ICuSiMCEA4qjGlYedTglLGIslM/hB0CEEJ4rgmCV48AAuI/x2iNFp8='
      },
      lang: 'javascript'
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

<style scoped lang="scss">
.container {
  min-width: 540px;
  text-align: center;
  box-sizing: border-box;
  padding: 40px 80px;
  padding-top: 0;
  border-top: solid 10px #eee;
}
@media screen and (max-width: 800px) {
  .container {
    padding: 20px 20px;
    padding-top: 0;
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
  height: 570px;
  border-radius: 4px;
  overflow: hidden;
  border: solid 1px black;
  margin-bottom: 40px;
  box-shadow: 0 0 20px 0 rgba(0, 0, 0, 0.5);
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
  width: 100%;
  max-width: 560px;
  text-align: right;
  .link a {
    font-size: 10px;
    color: black;
  }
}
</style>
