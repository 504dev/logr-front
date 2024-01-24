<template>
  <div class="container">
    <div class="dashboard" :class="{ shared: user.id !== dash.owner_id }">
      <router-link :to="`/dashboard/${dash.id}/logs`" class="title">
        <span>{{ dash.name }}</span>
      </router-link>
      <div class="team">
        <a :href="`https://github.com/${dash.owner.github_id ? dash.owner.username : '504dev/logr'}`">
          <img
            :src="`https://avatars.githubusercontent.com/u/${dash.owner.github_id}`"
            :title="dash.owner.username"
            class="owner"/></a
        ><a v-for="member in members" :key="member.id" :href="`https://github.com/${member.user.username}`"
          ><img
            :src="`https://avatars.githubusercontent.com/u/${member.user.github_id}`"
            :title="member.user.username"
            :key="member.user_id"
            class="member"
            :style="{ marginLeft: -2 - members.length + 'px' }"
          />
        </a>
      </div>
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
        <div class="empty" v-if="isEmpty">no data</div>
      </div>
      <div class="tools">
        <span @click="onShare(dash)" title="share">
          <font-awesome-icon class="icon" icon="share" />
        </span>
        <span @click="onEdit(dash)">
          <font-awesome-icon class="icon" icon="edit" title="edit" />
        </span>
        <span @click="onDelete(dash)">
          <font-awesome-icon class="icon" icon="trash-alt" title="remove" />
        </span>
        <span @click="onKeys(dash)">
          <font-awesome-icon class="icon" icon="key" title="keys" />
        </span>
      </div>
    </div>
    <share-modal :dash="dash" :name="`share-${dash.id}`" />
    <keys-modal :dash="dash" :name="`keys-${dash.id}`" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import ACTIONS from '../store/action-types'
import ShareModal from './ShareModal'
import KeysModal from './KeysModal'

export default {
  components: {
    ShareModal,
    KeysModal
  },
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
    return {
      stats: null,
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
    members() {
      return this.dash.members.slice(0, 9)
    }
  },
  methods: {
    onShare(dash) {
      this.$modal.show(`share-${dash.id}`)
    },
    onKeys(dash) {
      this.$modal.show(`keys-${dash.id}`)
    },
    async onEdit(dash) {
      const name = prompt('Edit dash name:', dash.name)
      if (!name) {
        return
      }
      await this.$store.dispatch(ACTIONS.EDIT_DASHBOARD, { id: dash.id, name })
    },
    async onDelete(dash) {
      const confirm = prompt('Please type in the name of the dashboard to confirm:')
      if (confirm === null) {
        return
      }
      if (confirm === dash.name) {
        await this.$store.dispatch(ACTIONS.DELETE_DASHBOARD, dash.id)
      } else {
        alert('Canceled.')
      }
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
  border-bottom-width: 2px;
  vertical-align: top;
  white-space: nowrap;
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
    text-align: right;
    display: inline-block;
    position: absolute;
    top: 10px;
    right: 10px;
    max-width: 80px;
    height: 16px;
    /*outline: dashed 1px red;*/
    a {
      img {
        box-shadow: 0 0 0 1px black;
        position: relative;
        width: 16px;
        height: 16px;
        border-radius: 4px;
        margin: 0;
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
      background-position-y: -4px;
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
</style>
