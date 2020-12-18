<template>
  <div class="container">
    <div class="dashboard" :class="{ shared: user.id !== dash.owner_id }">
      <router-link :to="`/dashboard/${dash.id}/logs`" class="title">
        <span>{{ dash.name }}</span>
      </router-link>
      <span class="team">
        <a :href="`https://github.com/${dash.owner.username}`">
          <img
            :src="`https://avatars.githubusercontent.com/u/${dash.owner.github_id}`"
            :title="dash.owner.username"
            class="owner"/></a
        ><a v-for="member in dash.members" :key="member.id" :href="`https://github.com/${member.user.username}`"
          ><img
            :src="`https://avatars.githubusercontent.com/u/${member.user.github_id}`"
            :title="member.user.username"
            :key="member.user_id"
            class="member"
          />
        </a>
      </span>
      <div v-if="loaded">
        <router-link
          :to="`/dashboard/${dash.id}/logs`"
          class="window list window-logs"
          :class="{ x2: !hasCounts }"
          v-if="hasLogs"
          ><span>logs</span></router-link
        ><router-link
          :to="`/dashboard/${dash.id}/counts`"
          class="window list window-counts"
          :class="{ x2: !hasLogs }"
          v-if="hasCounts"
        >
          <span>cnts</span>
        </router-link>
        <div class="empty" v-if="isEmpty">(empty)</div>
      </div>
      <div class="tools">
        <span @click="onEdit(dash)">
          <font-awesome-icon class="icon" icon="edit" />
        </span>
        <span @click="onShare(dash)">
          <font-awesome-icon class="icon" icon="share" />
        </span>
        <span @click="onDelete(dash)">
          <font-awesome-icon class="icon" icon="trash-alt" />
        </span>
        <span @click="onKeys(dash)">
          <font-awesome-icon class="icon" icon="key" />
        </span>
      </div>
    </div>
    <modal :name="`keys-${dash.id}`" width="480" height="330">
      <div class="modal">
        <select v-model="lang" class="selected">
          <option :value="opt" v-for="opt in options" :key="opt">{{ opt }}</option>
        </select>
        <div v-for="key in dash.keys" :key="key.public_key" class="keys" :class="lang">{{ code[lang] }}</div>
      </div>
    </modal>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import ACTIONS from '../store/action-types'
export default {
  props: {
    dash: Object
  },
  async created() {
    const [logs, counts] = await Promise.all([
      this.$store.dispatch(ACTIONS.LOAD_LOGS_LOGNAMES, this.dash.id),
      this.$store.dispatch(ACTIONS.LOAD_COUNTS_LOGNAMES, this.dash.id)
    ])
    this.stats = { logs, counts }
    this.loaded = true
  },
  data() {
    const options = ['plain', 'javascript', 'golang', 'python', 'php']
    return {
      stats: null,
      options,
      lang: options[1],
      loaded: false
    }
  },
  computed: {
    ...mapState(['user']),
    hasLogs() {
      return this.stats && this.stats.logs.length
    },
    hasCounts() {
      return this.stats && this.stats.counts.length
    },
    isEmpty() {
      return !this.hasLogs && !this.hasCounts
    },
    code() {
      const key = this.dash.keys[0]
      const plain = `\
/* public key */
${key.public_key}

/* private key */
${key.private_key}
`
      const javascript = `\
const { Logr } = require('logr-node-client');

const conf = new Logr({
  udp: ':7776',
  publicKey: '${key.public_key}',
  privateKey: '${key.private_key}',
});

const logr = conf.newLogger('hello.log');

logr.info('Hello, Logr!');`
      const golang = `\
import logrc "github.com/504dev/logr-go-client"

func main() {
    conf := logrc.Config{
        Udp:        ":7776",
        PublicKey:  "${key.public_key}",
        PrivateKey: "${key.private_key}",
    }
    logr, _ = conf.NewLogger("hello.log")

    logr.Info("Hello, Logr!")
}`
      const python = `\
from logrpy import Logr

conf = Logr(
    ('127.0.0.1', 7776),
    '${key.public_key}',
    '${key.private_key}',
)

logr = conf.getlogger('hello.log')

logr.info('Hello, Logr!')`
      const php = `\
$conf = new Logr(
    ':7776',
    '${key.public_key}',
    '${key.private_key}
);

$logr = $conf->getLogger('hello.log');

$logr->info('Hello, Logr!');`
      return { plain, javascript, golang, python, php }
    }
  },
  methods: {
    async onShare(dash) {
      const username = prompt('Enter @username to share:')
      if (!username) {
        return
      }
      try {
        await this.$store.dispatch(ACTIONS.SHARE_DASHBOARD, { dashId: dash.id, username })
        alert('Shared')
      } catch (e) {
        console.error(e.response)
        switch (e.response.status) {
          case 404:
            return alert('User not found')
          case 505:
            return alert('Error')
        }
      }
    },
    async onEdit(dash) {
      const name = prompt('Edit dash name:', dash.name)
      if (!name) {
        return
      }
      await this.$store.dispatch(ACTIONS.EDIT_DASHBOARD, { id: dash.id, name })
    },
    async onDelete(dash) {
      const confirm = prompt('Enter dash name for delete:')
      if (confirm === null) {
        return
      }
      if (confirm === dash.name) {
        await this.$store.dispatch(ACTIONS.DELETE_DASHBOARD, dash.id)
      } else {
        alert('Canceled.')
      }
    },
    onKeys(dash) {
      this.$modal.show(`keys-${dash.id}`)
    }
  }
}
</script>

<style lang="scss" scoped>
.container {
  display: inline-block;
  position: relative;
  margin: 20px 20px 0 0;
}
.dashboard {
  box-sizing: border-box;
  display: inline-block;
  position: relative;
  width: 220px;
  height: 160px;
  background-color: #eee;
  padding: 10px;
  border-radius: 4px;
  border: solid 1px #000;
  /*border: solid 1px #ccc;*/
  border-bottom-width: 2px;
  vertical-align: top;
  .title {
    color: black;
    font-weight: bold;
    font-size: 16px;
    text-decoration: none;
    &:hover {
      /*color: red;*/
      text-decoration: underline;
    }
  }
  .team {
    display: inline-block;
    position: absolute;
    top: 10px;
    right: 10px;
    img {
      box-shadow: 0 0 1px 0 black;
      position: relative;
      width: 16px;
      height: 16px;
      border-radius: 16px;
      margin: 0;
      margin-left: -2px;
      z-index: 1;
      &.member {
        float: right;
      }
      &.owner {
        z-index: 2;
      }
      &:hover {
        z-index: 3;
      }
    }
  }
  .empty {
    margin-top: 45px;
    color: grey;
    text-align: center;
  }
  .window {
    box-sizing: border-box;
    display: inline-block;
    vertical-align: top;
    width: 95px;
    height: 80px;
    margin-top: 15px;
    padding-top: 38px;
    background-color: #ddd;
    border: solid 1px #000;
    cursor: pointer;
    color: #fff;
    text-align: center;
    text-decoration: none;
    span {
      display: none;
    }
    &:hover {
      span {
        display: inline-block;
      }
    }
    &.window-logs {
      /*font-size: 20px;*/
      /*margin-right: 8px;*/
      background-color: #444;
      background-image: url('/static/logs.jpg');
      background-size: 90px;
      opacity: 0.88;
      width: 120px;
      border-radius: 4px 0 0 4px;
      &:hover {
        opacity: 0.99;
      }
    }
    &.window-counts {
      /*font-size: 18px;*/
      background-image: url('/static/counts.jpg');
      background-size: 110px;
      background-position-y: -5px;
      background-position-x: 0;
      opacity: 0.8;
      width: 78px;
      border-radius: 0 4px 4px 0;
      &:not(.x2) {
        border-left: 0;
      }
      &:hover {
        opacity: 1;
      }
    }
    &.x2 {
      width: 100%;
      border-radius: 4px;
    }
    &.--no--list {
      margin-top: 7px;
      width: 200px;
      height: 40px;
      border: solid 1px #000;
      line-height: 40px;
      &.window-logs {
        margin-right: 0;
      }
      &.window-counts {
        background-size: 55px;
        background-position-y: -5px;
      }
      &.x2 {
        height: 90px;
        line-height: 90px;
        &.window-counts {
          background-size: 110px;
          background-position-y: 0;
        }
      }
    }
  }
  &.shared .tools {
    display: none;
  }
  .tools {
    zoom: 0.75;
    position: absolute;
    bottom: 0;
    right: 0;
    margin: 5px;
    .icon {
      cursor: pointer;
      margin: 5px;
    }
  }
}
.modal {
  padding: 10px;
  .keys {
    border: solid 1px #111;
    background-color: #eee;
    font-family: 'Monaco', 'Menlo', 'Consolas', 'Courier New', monospace;
    font-size: 14px;
    margin-top: 10px;
    padding: 10px;
    border-radius: 4px;
    white-space: pre;
    overflow: scroll;
    height: 245px;
    &.javascript {
      background-color: #fdb;
    }
    &.golang {
      background-color: #bfd;
    }
    &.python {
      background-color: #bdf;
    }
    &.php {
      background-color: #fbd;
    }
  }
}
</style>
