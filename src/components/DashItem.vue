<template>
  <div class="dashboard" :class="{ shared: user.id !== dash.owner_id }">
    <router-link :to="`/dashboard/${dash.id}/logs`">
      <h3>{{ dash.name }}</h3>
    </router-link>
    <span class="tools">
      <span @click="onShare(dash)">
        <i class="icon fas fa-share"></i>
      </span>
      <span @click="onDelete(dash)">
        <i class="icon fas fa-trash-alt"></i>
      </span>
      <span @click="onKeys(dash)">
        <i class="icon fas fa-key"></i>
      </span>
    </span>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import ACTIONS from '../store/action-types'
export default {
  props: {
    dash: Object
  },
  data () {
    return {
      //
    }
  },
  computed: {
    ...mapState(['user'])
  },
  methods: {
    async onShare (dash) {
      const username = prompt('Enter @username to share:')
      if (!username) {
        return
      }
      const resp = await this.$store.dispatch(ACTIONS.SHARE_DASHBOARD, { dashId: dash.id, username })
      alert('Shared')
    },
    onDelete (dash) {
      const confirm = prompt('Enter dash name for delete:')
      if (confirm === dash.name) {
        alert('Deleted')
      }
    },
    onKeys (dash) {
      alert(`key:\n${dash.public_key}\n\nsecret:\n${dash.private_key}`)
    }
  }
}
</script>

<style lang="scss" scoped>
  .dashboard {
    text-decoration: none;
    display: inline-block;
    width: 200px;
    height: 100px;
    background-color: #cccccc;
    margin: 0 20px 20px 0;
    padding: 10px;
    border-radius: 4px;
    &.shared .tools {
      display: none;
    }
  }
  .icon {
    cursor: pointer;
    margin: 5px;
  }
</style>
