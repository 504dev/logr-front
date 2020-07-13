<template>
  <table :class="{ fullscreen, 'left-orient': !orient, 'head-orient': orient }" v-if="this.user && this.dash">
    <tr v-show="orient && !fullscreen">
      <td class="header">
        <router-link to="/dashboards"
          ><img class="avatar" :src="`https://avatars0.githubusercontent.com/u/${user.github_id}`"
        /></router-link>
        <span class="name">{{ dash.name }}</span>
        <div class="filters">
          <slot name="filters" />
        </div>
        <small class="goto">
          <slot name="goto" />
        </small>
        <div class="kinds">
          <slot name="kinds" />
        </div>
        <div class="customs">
          <slot name="customs" />
        </div>
      </td>
    </tr>
    <tr>
      <td class="lefter" v-show="!orient && !fullscreen">
        <router-link to="/dashboards"
          ><img class="avatar" :src="`https://avatars0.githubusercontent.com/u/${user.github_id}`"
        /></router-link>
        <div class="name">{{ dash.name }}</div>
        <small class="goto">
          <slot name="goto" />
        </small>
        <div class="filters">
          <slot name="filters" />
        </div>
        <div class="kinds">
          <slot name="kinds" />
        </div>
        <div class="customs">
          <slot name="customs" />
        </div>
      </td>
      <td>
        <div class="content">
          <span v-if="loading">
            <!--            <span>Loading...</span>-->
            <font-awesome-icon icon="compact-disc" spin size="2x" class="spinner" />
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
import MUTATIONS from '@/store/mutations-types.js'

export default {
  props: {
    loading: Boolean,
    orient: Number
  },
  computed: {
    ...mapState(['user', 'dashboards', 'fullscreen']),
    dash() {
      return (this.dashboards || []).find(dash => dash.id === +this.$route.params.id)
    },
    arrowDirection() {
      return this.orient ? (this.fullscreen ? 'down' : 'up') : this.fullscreen ? 'right' : 'left'
    }
  },
  methods: {
    onFull() {
      this.$store.commit(MUTATIONS.SWITCH_FULL)
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
        padding-bottom: 80px;
        /*border-right: solid 1px black;*/
        .name {
          color: #111;
          font-weight: bold;
          text-align: center;
          /*margin-left: 36px;*/
          margin-top: 6px;
          margin-bottom: 14px;
          max-width: 180px;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .customs {
          display: inline-block;
          position: absolute;
          left: 0;
          bottom: 0;
          padding: 10px;
          padding-bottom: 15px;
        }
        .goto {
          position: absolute;
          right: 0;
          bottom: 0;
          margin-right: 10px;
          margin-bottom: 17px;
        }
      }
      &.header {
        padding: 10px;
        padding-bottom: 5px;
        height: 30px;
        background-color: #ddd;
        /*border-bottom: solid 1px black;*/
        .name {
          color: #111;
          font-weight: bold;
          margin-left: 36px;
          line-height: 32px;
        }
        .customs {
          display: inline-block;
          position: absolute;
          right: 15px;
          top: 15px;
        }
        .goto {
          position: absolute;
          right: 75px;
          top: 17px;
          /*display: none;*/
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
          margin-top: 5px;
          margin-left: 1px;
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
      select,
      input {
        margin-bottom: 10px;
      }
      #filter-regexp {
        margin-bottom: 10px;
      }
      #filter-message {
        height: 50px;
        font-size: 20px;
      }
    }
  }
  &.head-orient {
    .filters {
      padding-top: 7px;
      /*padding-right: 60px;*/
      /*padding-left: 35px;*/
      line-height: 35px;
      select,
      input {
        margin-right: 8px;
      }
      #filter-version {
        float: inherit;
      }
      #filter-agg {
        float: inherit;
      }
      #filter-regexp {
        display: inline-block;
        margin-right: 8px;
        width: 200px;
      }
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
      margin-left: -10px;
      transform: rotate(-90deg);
    }
    &.up {
      &::before {
        content: '\00a0❯';
      }
      //margin-top: -30px;
      //transform: rotate(90deg);
    }
  }

  a {
    color: #111;
  }

  .avatar {
    position: absolute;
    top: 13px;
    left: 11px;
    width: 24px;
    height: 24px;
    border-radius: 24px;

    &:hover {
      box-shadow: 0 0 0 1px green;
    }
  }

  .kinds {
    font-size: 13px;
    .kindblock {
      margin-top: 10px;
      vertical-align: top;
      text-align: left;
      .kindname {
        a {
          font-weight: bold;
          text-decoration: none;
        }
      }
      .keynames {
        vertical-align: top;
        text-align: left;
        a {
          text-decoration: none;
          &:hover {
            text-decoration: underline;
          }
        }
      }
    }
  }

  &.head-orient {
    .kinds {
      /*text-align: center;*/
      /*margin-left: 26px;*/
      .kindblock {
        display: inline-block;
        margin: 5px 15px;
        margin-left: 5px;
        .kindname {
          a:hover {
            text-decoration: underline;
          }
        }
        .keynames {
          display: none;
        }
      }
    }
  }
}
</style>
