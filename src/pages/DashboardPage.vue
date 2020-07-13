<template>
  <div class="wrapper" v-if="this.user && this.dashboards">
    <div class="hello">
      <img class="avatar" :src="`https://avatars0.githubusercontent.com/u/${jwtPayload.github_id}`" />
      <span>
        <strong>{{ jwtPayload.username }}</strong>
        |
        <a href="#" @click.prevent="$store.dispatch(ACTIONS.LOGOUT)">
          <font-awesome-icon icon="sign-out-alt" />
        </a>
      </span>
    </div>
    <div>
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
import { mapState, mapGetters } from 'vuex'

export default {
  components: {
    DashItem
  },
  async created() {
    this.$store.dispatch(ACTIONS.LOAD_ME)
    this.$store.dispatch(ACTIONS.LOAD_DASHBOARDS)
    const version = await this.$store.dispatch(ACTIONS.VERSION)
    console.log({ version })
  },
  data() {
    return {
      ACTIONS
    }
  },
  computed: {
    ...mapGetters(['jwtPayload', 'dashgroups']),
    ...mapState(['user', 'dashboards'])
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
  padding: 20px;
  .hello {
    position: relative;
    top: -32px;
    left: -32px;
    margin-bottom: -20px;
    .avatar {
      width: 64px;
      height: 64px;
      border-radius: 32px;
    }
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
