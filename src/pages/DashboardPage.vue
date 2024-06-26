<template>
  <div class="wrapper" v-if="this.user && this.dashboards && this.globals">
    <div class="hello" :class="{ single: !globals.org }">
      <logo :pattern="globals.org ? 'og' : 'g'" class="og" />
      <img
        class="avatar org"
        :src="`https://github.com/${globals.org}.png?size=128`"
        :title="globals.org"
        v-if="globals.org"
      />
      <img
        class="avatar usr"
        :src="`https://avatars.githubusercontent.com/u/${jwtPayload.github_id}`"
        :title="user.username"
      />
      <span class="nav">
        <span class="username">{{ jwtPayload.username }}</span>
        <span>|</span>
        <a href="#" @click.prevent="$store.dispatch(ACTIONS.LOGOUT)">
          <FontAwesomeIcon icon="sign-out-alt" />
        </a>
      </span>
    </div>
    <div v-if="user.role !== RoleViewer">
      <h1>Own</h1>
      <dash-item v-for="dash in dashgroups.own" :dash="dash" :key="dash.id" />
      <div
        title="Add dashboard"
        class="ghost"
        :class="{ mini: dashgroups.own.length > 0 }"
        @click="onAddDashboard"
      ></div>
    </div>
    <div>
      <h1>Shared</h1>
      <span v-if="dashgroups.shared.length === 0"></span>
      <dash-item v-else v-for="dash in dashgroups.shared" :dash="dash" :key="dash.id" />
    </div>
    <div class="watermark">logr</div>
  </div>
</template>

<script>
import DashItem from '@/components/DashItem.vue'
import Logo from '@/components/Logo.vue'
import ACTIONS from '@/store/action-types'
import { RoleViewer } from '@/constants/roles'
import { mapState, mapGetters } from 'vuex'

export default {
  components: {
    DashItem,
    Logo
  },
  async created() {
    await Promise.all([
      this.$store.dispatch(ACTIONS.LOAD_ME),
      this.$store.dispatch(ACTIONS.LOAD_DASHBOARDS),
      this.$store.dispatch(ACTIONS.LOAD_GLOBALS)
    ])
    document.title = this.user.username + (this.globals.org ? ` (${this.globals.org})` : '')
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
  position: relative;
  box-sizing: border-box;
  padding: 20px;
  min-width: 540px;
  a {
    color: #111;
    &:hover {
      color: black;
    }
  }
  .hello {
    position: relative;
    margin-bottom: 85px;
    &.single {
      margin-left: -42px;
    }
    .avatar {
      position: absolute;
      border: solid 1px black;
      top: -9px;
      width: 50px;
      height: 50px;
      border-radius: 32px;
      &.org {
        left: -9px;
      }
      &.usr {
        left: 34px;
      }
    }
    .og {
      position: absolute;
      top: -48px;
      left: -26px;
      z-index: -1;
      opacity: 0.9;
    }
    .nav {
      font-size: 16px;
      position: absolute;
      display: inline-block;
      top: 8px;
      left: 96px;
      .username {
        font-weight: 501;
      }
    }
  }
  h1 {
    color: #eee;
    /*border-bottom: dashed 1px black;*/
    margin: 25px 0 -10px -10px;
  }
  .ghost {
    display: inline-block;
    vertical-align: bottom;
    box-sizing: border-box;
    width: 220px;
    height: 160px;
    border-radius: 4px;
    padding: 10px;
    margin: 20px 20px 0 0;
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
      width: 88px;
      height: 64px;
      line-height: 28px;
      font-size: 48px;
      border-width: 3px;
    }
  }
  .watermark {
    font-family: Logr;
    /*text-transform: uppercase;*/
    font-size: 24px;
    display: inline-block;
    position: fixed;
    bottom: 0;
    right: 0;
    color: #eee;
    padding: 10px 15px;
    z-index: -99;
    pointer-events: none;
  }
}
</style>
