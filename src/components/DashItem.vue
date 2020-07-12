<template>
  <div class="container">
    <div class="dashboard" :class="{ shared: user.id !== dash.owner_id }">
      <router-link :to="`/dashboard/${dash.id}/logs`" class="title">
        <span>{{ dash.name }}</span>
      </router-link>
      <span class="team">
        <a :href="`https://github.com/${dash.owner.username}`">
          <img
            :src="`https://avatars0.githubusercontent.com/u/${dash.owner.github_id}`"
            :title="dash.owner.username"
            class="owner"/></a
        ><a v-for="member in dash.members" :key="member.id" :href="`https://github.com/${member.user.username}`"
          ><img
            :src="`https://avatars0.githubusercontent.com/u/${member.user.github_id}`"
            :title="member.user.username"
            :key="member.user_id"
            class="member"
          />
        </a>
      </span>
      <div>
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
          <span>counts</span>
        </router-link>
        <div class="empty" v-if="isEmpty">empty yet.</div>
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
    <modal :name="`keys-${dash.id}`" width="320">
      <div v-for="key in dash.keys" :key="key.public_key" class="keys">
        <p><label>Public:</label><br />{{ key.public_key }}</p>
        <p><label>Private:</label><br />{{ key.private_key }}</p>
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
  data() {
    return {
      //
    }
  },
  computed: {
    ...mapState(['user']),
    hasLogs() {
      return !!this.dash.lognames.logs
    },
    hasCounts() {
      return !!this.dash.lognames.counts
    },
    isEmpty() {
      return !this.hasLogs && !this.hasCounts
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
      if (confirm === dash.name) {
        await this.$store.dispatch(ACTIONS.DELETE_DASHBOARD, dash.id)
      } else {
        alert('Wrong name.')
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
  margin: 10px 20px 0 0;
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
  border: solid 1px black;
  border-bottom-width: 2px;
  .title {
    color: black;
    font-weight: bold;
    font-size: 16px;
    text-decoration: none;
    &:hover {
      color: red;
    }
  }
  .team {
    display: inline-block;
    position: absolute;
    top: 10px;
    right: 10px;
    img {
      position: relative;
      width: 16px;
      height: 16px;
      border-radius: 16px;
      margin: 0;
      margin-right: -4px;
      z-index: 1;
      &.member {
        //
      }
      &.owner {
        margin-right: 0;
      }
      &:hover {
        z-index: 2;
      }
    }
  }
  .empty {
    margin-top: 40px;
    color: grey;
    text-align: center;
  }
  .window {
    box-sizing: border-box;
    display: inline-block;
    vertical-align: top;
    width: 95px;
    height: 60px;
    margin-top: 20px;
    border-radius: 3px;
    background-color: #ddd;
    border: dashed 1px #000;
    cursor: pointer;
    line-height: 60px;
    color: #fff;
    text-align: center;
    text-decoration: none;
    span {
      display: none;
    }
    &:hover {
      opacity: 1;
      span {
        display: inline-block;
      }
    }
    &.window-logs {
      opacity: 0.7;
      font-size: 28px;
      margin-right: 8px;
      background-color: #444;
      background-image: url('/static/logs.jpg');
      background-size: 90px;
    }
    &.window-counts {
      opacity: 0.8;
      font-size: 24px;
      background-image: url('/static/counts.jpg');
      background-size: 95px;
      background-position-y: -15px;
    }
    &.x2 {
      width: 100%;
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
.keys {
  padding: 10px;
  word-wrap: break-word;
  label {
    color: grey;
  }
}
</style>
