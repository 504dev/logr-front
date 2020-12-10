<template>
  <div class="wrapper" v-if="this.user && this.dashboards && this.globals">
    <div class="hello">
      <img
        class="avatar"
        :class="{ child: !!globals.org }"
        :src="`https://avatars.githubusercontent.com/u/${jwtPayload.github_id}`"
      />
      <img
        class="avatar"
        :class="{ org: !!globals.org }"
        :src="`https://github.com/${globals.org}.png`"
        v-if="globals.org"
      />
      <span>
        <span class="username">{{ jwtPayload.username }}</span>
        |
        <a href="#" @click.prevent="$store.dispatch(ACTIONS.LOGOUT)">
          <font-awesome-icon icon="sign-out-alt" />
        </a>
      </span>
    </div>
    <div v-if="user.role < RoleViewer">
      <h1>Own</h1>
      <template v-for="dash in dashgroups.own">
        <dash-item :dash="dash" :key="dash.id" />
      </template>
      <div class="ghost" :class="{ mini: dashgroups.own.length > 0 }" @click="onAddDashboard"></div>
    </div>
    <div>
      <h1>Shared</h1>
      <span v-if="dashgroups.shared.length === 0">No dashboards</span>
      <template v-else v-for="dash in dashgroups.shared">
        <dash-item :dash="dash" :key="dash.id" />
      </template>
    </div>
  </div>
</template>

<script>
import DashItem from '../components/DashItem'
import ACTIONS from '../store/action-types'
import { RoleViewer } from '../../constants/roles'
import { mapState, mapGetters } from 'vuex'

export default {
  components: {
    DashItem
  },
  async created() {
    this.$store.dispatch(ACTIONS.LOAD_ME)
    this.$store.dispatch(ACTIONS.LOAD_DASHBOARDS)
    this.$store.dispatch(ACTIONS.LOAD_GLOBALS)
  },
  data() {
    return {
      ACTIONS,
      RoleViewer
    }
  },
  computed: {
    ...mapState(['user', 'dashboards', 'globals']),
    ...mapGetters(['jwtPayload', 'dashgroups'])
  },
  methods: {
    async onAddDashboard() {
      const name = prompt('Enter dashboard name:')
      if (name) {
        await this.$store.dispatch(ACTIONS.ADD_DASHBOARD, name)
      }
    }
  }
}
</script>

<style scoped lang="scss">
.wrapper {
  box-sizing: border-box;
  padding: 20px;
  height: 100%;
  a {
    color: #111;
    &:hover {
      color: black;
    }
  }
  .hello {
    position: relative;
    top: -30px;
    left: -30px;
    margin-bottom: -20px;
    .avatar {
      width: 64px;
      height: 64px;
      border-radius: 32px;
      border: solid 1px black;
      &.child {
        position: absolute;
        top: 32px;
        left: 32px;
        width: 32px;
        height: 32px;
      }
      &.org {
        border-color: black;
      }
    }
  }
  .username {
    font-weight: 500;
  }
  h1 {
    color: #eee;
    /*border-bottom: dashed 1px black;*/
    margin: 30px 0 0 -15px;
  }
  .ghost {
    display: inline-block;
    vertical-align: bottom;
    box-sizing: border-box;
    width: 220px;
    height: 160px;
    border-radius: 4px;
    padding: 10px;
    margin: 0;
    margin-top: 10px;
    border: dashed 4px #eee;
    color: #eee;
    line-height: 110px;
    text-align: center;
    font-size: 100px;
    cursor: pointer;
    &::before {
      content: '+';
    }
    &:hover {
      color: #9e9;
      border-color: #9e9;
    }
    &.mini {
      width: 110px;
      height: 80px;
      line-height: 40px;
      font-size: 60px;
      zoom: 0.6;
    }
  }
}
</style>
