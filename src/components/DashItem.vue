<template>
  <div class="container">
    <div class="dashboard" :class="{ shared: user.id !== dash.owner_id }">
      <router-link :to="`/dashboard/${dash.id}/logs`">
        <strong>{{ dash.name }}</strong>
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
        <router-link :to="`/dashboard/${dash.id}/logs`" class="window logs"></router-link>
        <router-link :to="`/dashboard/${dash.id}/counts`" class="window counts"></router-link>
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
        <p><b>Public:</b><br />{{ key.public_key }}</p>
        <p><b>Private:</b><br />{{ key.private_key }}</p>
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
    ...mapState(['user'])
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
  display: inline-block;
  position: relative;
  width: 200px;
  height: 140px;
  box-shadow: 2px 2px #ddd;
  background-color: #eee;
  padding: 10px;
  border-radius: 4px;
  a {
    color: black;
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
  .window {
    display: inline-block;
    vertical-align: top;
    margin-top: 10px;
    width: 90px;
    height: 90px;
    border-radius: 45px;
    background-color: #ddd;
    cursor: pointer;
    &.logs {
      background-color: #444;
      /*background-image: url('/static/logs.jpg');*/
      /*background-size: 90px;*/
    }
    &.counts {
      /*background-image: url('/static/counts.jpg');*/
      /*background-size: 90px;*/
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
}
</style>
