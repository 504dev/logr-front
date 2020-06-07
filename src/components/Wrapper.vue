<template>
  <div class="wrapper" v-if="this.user && this.dash">
    <div class="lefter">
      <img class="avatar" :src="`https://avatars0.githubusercontent.com/u/${user.github_id}`" />
      <h3><router-link to="/dashboards">..</router-link>/{{ dash.name }}</h3>
      <div class="filters">
        <slot name="filters"></slot>
      </div>
      <div class="bottom">
        <a href="#" @click="switchMode"><i class="icon fas fa-moon"></i></a>
      </div>
    </div>
    <div class="container" :class="{ night: mode === 0 }">
      <span v-if="loading">Loading...</span>
      <slot v-else name="content"></slot>
    </div>
  </div>
</template>

<script>
import store from 'store2'
import { mapState } from 'vuex'

export default {
  props: {
    loading: Boolean
  },
  data() {
    const mode = store.get('mode', 0)
    console.log({ mode })
    return {
      mode
    }
  },
  computed: {
    ...mapState(['user', 'dashboards']),
    dash() {
      return (this.dashboards || []).find(dash => dash.id === +this.$route.params.id)
    }
  },
  methods: {
    switchMode() {
      this.mode = 1 - this.mode
      store.set('mode', this.mode)
    }
  }
}
</script>

<style lang="scss" scoped>
.lefter {
  position: fixed;
  padding: 10px;
  height: 100%;
  width: 200px;
  background-color: rgba(224, 224, 224, 0.9);
  z-index: 901;

  .avatar {
    width: 32px;
    height: 32px;
    border-radius: 16px;
  }

  .filters {
    margin-top: 20px;
    display: block;
    select,
    input {
      box-sizing: border-box;
      display: block;
      margin-bottom: 10px;
      width: 100%;
      height: 30px;
      padding: 0 10px;
      border: solid 1px #999;
    }
    input:focus {
      outline: none;
      border-bottom: solid 1px green;
    }
  }

  .bottom {
    text-align: right;
    position: absolute;
    left: 0;
    right: 0;
    bottom: 20px;
    padding: 10px;
  }
}

.container {
  font-family: Courier;
  font-size: 14px;
  position: absolute;
  height: 100%;
  width: 100%;
  padding: 10px 0 0 230px;
  overflow: scroll;
  z-index: 900;
  &.night {
    background-color: #000;
    color: white;
  }
}
</style>
