<template>
  <table :class="{ fullscreen, 'left-orient': !orient, 'head-orient': orient }" v-if="this.user && this.dash">
    <tr v-show="orient && !fullscreen">
      <td class="header">
        <div class="filters">
          <slot name="filters" />
        </div>
      </td>
    </tr>
    <tr>
      <td class="lefter" v-show="!orient && !fullscreen">
        <router-link to="/dashboards"
          ><img class="avatar" :src="`https://avatars0.githubusercontent.com/u/${user.github_id}`"
        /></router-link>
        <div class="filters">
          <slot name="filters" />
        </div>
      </td>
      <td>
        <div class="content">
          <span v-if="loading">
            <i class="fa fa-cog fa-spin fa-2x fa-fw spinner"></i>
            <!--            <span>Loading...</span>-->
          </span>
          <slot v-else name="content"></slot>
        </div>
        <span class="arrow" :class="arrowDirection" @click="onFull"></span>
      </td>
    </tr>
  </table>
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: {
    loading: Boolean,
    orient: Number
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
    },
    arrowDirection() {
      return this.orient ? (this.fullscreen ? 'down' : 'up') : this.fullscreen ? 'right' : 'left'
    }
  },
  methods: {
    onFull() {
      this.fullscreen = !this.fullscreen
      this.$nextTick(() => {
        window.dispatchEvent(new Event('resize'))
      })
    }
  }
}
</script>

<style scoped lang="scss">
table {
  position: absolute;
  top: 0;
  left: 0;
  background-color: #fff;
  color: #000;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  border-spacing: 0;
  &.night {
    background-color: #000;
    color: white;
  }
  tr {
    td {
      vertical-align: top;
      position: relative;
      margin: 0;
      padding: 0;
      &.lefter {
        background-color: #ddd;
        width: 180px;
        min-width: 180px;
        padding: 10px;
      }
      &.header {
        padding: 10px;
        height: 30px;
        background-color: #ddd;
        input,
        select {
          margin: 0;
        }
      }
      .content {
        font-family: Courier;
        position: absolute;
        top: 0;
        bottom: 0;
        box-sizing: border-box;
        width: 100%;
        margin: 0;
        padding: 5px 10px;
        overflow: scroll;
        font-size: 14px;
        .spinner {
          margin-left: -3px;
          margin-top: 5px;
        }
      }
    }
  }
  &.fullscreen {
    &.left-orient .content {
      padding-left: 30px;
    }
    &.head-orient .content {
      padding-top: 20px;
    }
  }
  &.left-orient {
    .filters {
      margin-top: 10px;
      select,
      input {
        margin-bottom: 10px;
      }
      #filter-regexp {
        margin-bottom: 10px;
        /*width: 200px;*/
      }
      #filter-message {
        height: 50px;
        font-size: 20px;
      }
    }
  }
  &.head-orient {
    .filters {
      select,
      input {
        margin-right: 8px;
      }
    }
    #filter-logname {
    }
    #filter-hostname {
    }
    #filter-level {
    }
    #filter-version {
      float: inherit;
    }
    #filter-message {
    }
    #filter-regexp {
      display: inline-block;
      margin-right: 8px;
      width: 200px;
    }
    #filter-limit {
      margin-top: 0;
    }
    .bottom {
      position: static;
      display: inline-block;
      float: right;
      margin-top: -40px;
    }
  }
  .arrow {
    color: #fff;
    position: absolute;
    top: 0;
    left: 0;
    display: block;
    width: 40px;
    height: 40px;
    margin: 0;
    padding: 0;
    background-color: rgba(128, 128, 128, 0.6);
    text-align: center;
    line-height: 40px;
    cursor: pointer;

    &::before {
      content: '\00a0❮';
    }

    &:hover {
      zoom: 1.1;
    }

    &.left,
    &.right {
      top: 55%;
      width: 20px;
      margin-top: -20px;
      border-radius: 20px 0 0 20px;
      &.left {
        margin-left: -20px;
      }
      &.right {
        margin-left: 0;
        transform: scale(-1, 1);
      }
    }
    &.up,
    &.down {
      left: 50%;
      width: 20px;
      margin-top: -10px;
      border-radius: 20px 0 0 20px;
      /*color: #000;*/
      //&.up {
      //  margin-left: -10px;
      //  margin-top: -30px;
      //  transform: rotate(90deg);
      //}
      //&.down {
      margin-left: -10px;
      transform: rotate(-90deg);
      //}
    }
  }

  a {
    color: #111111;
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
}
</style>
