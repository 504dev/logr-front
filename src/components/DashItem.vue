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
        ><a v-for="(member, i) in members" :key="member.id" :href="`https://github.com/${member.user.username}`"
          ><img
            :src="`https://avatars.githubusercontent.com/u/${member.user.github_id}`"
            :title="member.user.username"
            :key="member.user_id"
            class="member"
            :style="{
              marginLeft: (-2 - members.length) + 'px',
              zIndex: (members.length - i),
            }"
          />
        </a>
      </div>
      <div v-if="loaded">
        <router-link
          :to="`/dashboard/${dash.id}/logs`"
          class="window list window-logs"
          :class="{ x2: !hasCounts }"
          v-if="hasLogs"
          >
          <logs-preview :stats="stats.logs"/>
        </router-link
        ><router-link
          :to="`/dashboard/${dash.id}/counts`"
          class="window list window-counts"
          :class="{ x2: !hasLogs }"
          v-if="hasCounts"
        />
        <div class="empty" v-if="isEmpty">no data</div>
      </div>
      <div class="tools">
        <span @click="onKeys(dash)">
          <FontAwesomeIcon class="icon" icon="key" title="keys" />
        </span>
        <span @click="onShare(dash)" title="add member">
          <FontAwesomeIcon class="icon" icon="plus-square" title="add member" />
        </span>
        <span @click="onEdit(dash)">
          <FontAwesomeIcon class="icon" icon="edit" title="edit" />
        </span>
        <span @click="onDelete(dash)">
          <FontAwesomeIcon class="icon" icon="trash-alt" title="remove" />
        </span>
      </div>
    </div>
    <ModalsContainer />
    <KeysModal :dash="dash" :modal-id="`keys-${dash.id}`" class="confirm-modal" content-class="confirm-modal-content" />
    <MembersModal :dash="dash" :modal-id="`members-${dash.id}`" class="confirm-modal" content-class="confirm-modal-content"/>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import ACTIONS from '@/store/action-types'
import { ModalsContainer, useVfm } from 'vue-final-modal'
import MembersModal from '@/components/MembersModal.vue'
import KeysModal from '@/components/KeysModal.vue'
import LogsPreview from '@/components/LogsPreview.vue'

const vfm = useVfm()

export default {
  components: {
    ModalsContainer,
    MembersModal,
    KeysModal,
    LogsPreview,
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
      vfm.open(`members-${dash.id}`)
    },
    onKeys(dash) {
      vfm.open(`keys-${dash.id}`)
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

<style lang="scss">
.confirm-modal {
  display: flex;
  justify-content: center;
  align-items: center;
}
.confirm-modal-content {
  min-height: 200px;
  width: 540px;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: #f4f2f0;
  border-radius: 0.25rem;
}
</style>
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
  background-color: #f4f2f0;
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
        &.owner {
          z-index: 99;
        }
        &:hover {
          z-index: 100 !important;
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
    background-color: #000;
    border: solid 1px #000;
    cursor: pointer;
    color: #fff;
    text-align: left;
    text-decoration: none;
    overflow: hidden;
    &.window-logs {
      opacity: 0.88;
      width: 158px;
      border-radius: 4px 0 0 4px;
      &:hover {
        opacity: 0.99;
      }
      > * {
        margin-left: -38px;
      }
    }
    &.window-counts {
      background-image: url('/static/counts.jpg');
      background-size: 110px;
      background-position-y: -4px;
      background-position-x: 26px;
      opacity: 0.8;
      width: 40px;
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
      width: 180px;
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
    font-size: 12px;
    position: absolute;
    bottom: 8px;
    right: 8px;
    .icon {
      cursor: pointer;
      margin-left: 8px;
    }
  }
}
</style>
