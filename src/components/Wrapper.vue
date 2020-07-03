<template>
  <div class="wrapper" v-if="this.user && this.dash" :class="{ fullscreen }">
    <div class="lefter">
      <router-link to="/dashboards"
        ><img class="avatar" :src="`https://avatars0.githubusercontent.com/u/${user.github_id}`"
      /></router-link>
      <!--      <h3><router-link to="/dashboards">..</router-link>/{{ dash.name }}</h3>-->
      <div class="filters">
        <slot name="filters"></slot>
      </div>
      <div class="arrow" @click="fullscreen = !fullscreen"></div>
    </div>
    <div class="container">
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
    return {
      fullscreen: false
    }
  },
  computed: {
    ...mapState(['user', 'dashboards']),
    dash() {
      return (this.dashboards || []).find(dash => dash.id === +this.$route.params.id)
    }
  }
}
</script>

<style lang="scss" scoped>
.wrapper {
  position: absolute;
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  &.night {
    background-color: #000;
    color: white;
  }
  &.fullscreen {
    .lefter {
      margin-left: -220px;
      .arrow {
        border-radius: 0 20px 20px 0;
        right: -20px;
        /*background-color: blue;*/
        &::before {
          content: '❯\00a0';
        }
      }
    }
    .container {
      padding-left: 30px;
    }
  }
  .lefter {
    position: fixed;
    padding: 10px;
    height: 100%;
    width: 200px;
    /*background-color: rgba(224, 224, 224, 1);*/
    background-color: #ddd;
    z-index: 901;

    a {
      color: #111111;
    }

    .arrow {
      cursor: pointer;
      box-sizing: border-box;
      padding-top: 10px;
      text-align: center;
      position: absolute;
      top: 55%;
      margin-top: -20px;
      right: 0;
      width: 20px;
      height: 40px;
      border-radius: 20px 0 0 20px;
      background-color: rgba(128, 128, 128, 0.6);
      color: #fff;
      &::before {
        content: '\00a0❮';
      }
      &:hover {
        zoom: 1.1;
      }
    }

    .avatar {
      width: 24px;
      height: 24px;
      border-radius: 24px;
      border: solid 1px transparent;
      &:hover {
        border-color: green;
      }
    }

    .filters {
      margin-top: 10px;
      display: block;
      select,
      input {
        background-color: white;
        box-sizing: border-box;
        display: inline-block;
        margin-bottom: 10px;
        width: 100%;
        height: 30px;
        padding: 0 10px;
        border: solid 1px #999;
        border-bottom-width: 2px;
        border-radius: 4px;
      }
      input:focus {
        outline: none;
        border-bottom: solid 2px green;
      }
    }
  }
  .container {
    font-family: Courier;
    font-size: 14px;
    position: absolute;
    height: 100%;
    width: 100%;
    padding: 10px 10px 10px 230px;
    box-sizing: border-box;
    overflow: scroll;
    z-index: 900;
  }
}
</style>
