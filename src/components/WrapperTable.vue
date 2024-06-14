<template>
  <table
    class="wrapper"
    :class="{
      fullscreen,
      'left-orient': !orient,
      'head-orient': orient
    }"
    v-if="user && dash"
  >
    <tr v-if="orient" v-show="!fullscreen">
      <td class="header">
        <router-link to="/dashboards"
          ><img class="avatar" :src="`https://avatars.githubusercontent.com/u/${user.github_id}`"
        /></router-link>
        <select :value="dashId" class="dashboard" @change="onDashChange">
          <optgroup label="Own" v-if="dashgroups.own.length">
            <option v-for="dashboard in dashgroups.own" :value="dashboard.id" :key="dashboard.id"
              >{{ dashboard.name }}
            </option>
          </optgroup>
          <optgroup label="Shared" v-if="dashgroups.shared.length">
            <option v-for="dashboard in dashgroups.shared" :value="dashboard.id" :key="dashboard.id">{{
              dashboard.name
            }}</option>
          </optgroup>
        </select>
        <div class="filters">
          <slot name="filters" />
        </div>
        <div class="kinds">
          <slot name="kinds" />
        </div>
        <div class="customs">
          <slot name="customs" />
        </div>
        <div class="goto">
          <slot name="goto" />
        </div>
      </td>
    </tr>
    <tr>
      <td class="lefter" v-if="!orient" v-show="!fullscreen">
        <router-link to="/dashboards"
          ><img class="avatar" :src="`https://avatars.githubusercontent.com/u/${user.github_id}`"
        /></router-link>
        <select :value="dashId" class="dashboard" @change="onDashChange">
          <optgroup label="Own" v-if="dashgroups.own.length">
            <option v-for="dashboard in dashgroups.own" :value="dashboard.id" :key="dashboard.id"
              >{{ dashboard.name }}
            </option>
          </optgroup>
          <optgroup label="Shared" v-if="dashgroups.shared.length">
            <option v-for="dashboard in dashgroups.shared" :value="dashboard.id" :key="dashboard.id">{{
              dashboard.name
            }}</option>
          </optgroup>
        </select>
        <div class="filters">
          <slot name="filters" />
        </div>
        <div class="kinds">
          <slot name="kinds" />
        </div>
        <div class="customs">
          <slot name="customs" />
        </div>
        <div class="goto">
          <slot name="goto" />
        </div>
      </td>
      <td>
        <div class="content">
          <template v-if="loading">
            <spinner size="2x"/><spinner/>
          </template>
          <slot v-else name="content"></slot>
        </div>
        <router-link to="/dashboards" v-if="fullscreen"
          ><img class="avatar" :src="`https://avatars.githubusercontent.com/u/${user.github_id}`"
        /></router-link>
        <div class="arrow" :class="arrowDirection">
          <span @click="onFull"></span>
        </div>
      </td>
    </tr>
  </table>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import MUTATIONS from '@/store/mutations-types.js'
import Spinner from '@/components/Spinner.vue'
import { LOGS, COUNTS } from '@/constants/pages'

export default {
  components: {
    Spinner
  },
  props: {
    loading: Boolean,
  },
  computed: {
    ...mapState(['user', 'dashboards', 'fullscreen', 'orient']),
    ...mapGetters(['dashgroups']),
    dashId() {
      return +this.$route.params.id
    },
    dash() {
      return (this.dashboards || []).find(dash => dash.id === this.dashId)
    },
    arrowDirection() {
      return this.orient ? (this.fullscreen ? 'down' : 'up') : this.fullscreen ? 'right' : 'left'
    },
    gotoLink() {
      switch(this.$route) {
        case LOGS:
          return `/dashboard/${this.dashId}/${COUNTS}`
        case COUNTS:
          return `/dashboard/${this.dashId}/${LOGS}`
        default:
          return ''
      }
    }
  },
  methods: {
    onFull() {
      this.$store.commit(MUTATIONS.SWITCH_FULL)
    },
    onDashChange(e) {
      const id = e.target.value
      this.$router.push({ params: { ...this.$route.params, id } })
      this.$router.go()
    }
  }
}
</script>

<style lang="scss">
table.wrapper {
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

  a {
    color: #111;
  }

  .customs {
    a {
      margin-right: 4px;
    }
  }

  .avatar {
    position: absolute;
    top: 13px;
    left: 10px;
    width: 24px;
    height: 24px;
    border-radius: 24px;
    border: solid 1px black;
    z-index: 999;

    &:hover {
      box-shadow: 0 0 0 2px #9e9 !important;
    }
  }

  select.dashboard {
    margin-top: 2px;
    border: none;
    background: none;
    color: #111;
    font-weight: bold;
    font-size: 16px;
    padding-left: 32px;
  }

  td {
    vertical-align: top;
    position: relative;
    margin: 0;
    padding: 0;

    &.lefter {
      background-color: #e4e2e0;
      width: 180px;
      min-width: 180px;
      padding: 10px;
      padding-bottom: 110px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
      z-index: 800;
    }

    &.header {
      padding: 10px 90px 5px 10px;
      height: 30px;
      background-color: #e4e2e0;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
      z-index: 800;
    }

    .customs {
      font-size: 16px;
    }

    .goto {
      font-size: 13px;
    }

    .kinds {
      box-sizing: border-box;
      //font-family: Courier, monospace;
      font-size: 13px;
      overflow-x: scroll;
      max-width: 360px;
    }

    .content {
      font-family: Courier, monospace;
      position: absolute;
      top: 0;
      bottom: 0;
      box-sizing: border-box;
      width: 100%;
      margin: 0;
      padding: 5px 10px;
      overflow: scroll;
      font-size: 14px;
    }
  }

  .arrow {
    position: absolute;
    > span {
      box-sizing: border-box;
      display: block;
      color: #fff;
      position: absolute;
      z-index: 900;
      width: 40px;
      height: 40px;
      margin: 0;
      padding: 0;
      //background-color: rgba(128, 128, 128, 0.6);
      background-color: #888;
      text-align: center;
      line-height: 40px;
      cursor: pointer;

      &:hover {
        zoom: 1.1;
      }
    }

    &.left,
    &.right {
      top: 300px;
      bottom: 60px;
      left: 0;
      > span {
        top: 50%;
        left: 0;
        width: 20px;
        margin-top: -20px;
        border-radius: 0 20px 20px 0;
      }
    }
    &.left > span {
      line-height: 36px;
      border: solid 2px #e4e2e0;
      border-right: none;
      border-radius: 20px 0 0 20px;
      margin-left: -20px;
      &::before {
        content: '\00a0❮';
      }
    }
    &.right > span {
      &::before {
        content: '❯\00a0';
      }
    }

    &.up,
    &.down {
      top: 0;
      left: 0;
      right: 110px;
      > span {
        top: 0;
        right: 0;
        width: 20px;
        margin-top: -10px;
        border-radius: 20px 0 0 20px;
        margin-right: -10px;
        transform: rotate(-90deg);
      }
    }
    &.up > span {
      &::before {
        content: '\00a0❯';
      }
    }
    &.down > span {
      &::before {
        content: '\00a0❮';
      }
    }
  }

  &.night {
    background-color: #000;
    color: white;
  }

  &.reverse {
    .content {
      display: flex;
      flex-direction: column-reverse;
    }
  }

  &.left-orient {
    .customs {
      display: inline-block;
      position: absolute;
      left: 0;
      bottom: 0;
      padding: 10px;
      padding-bottom: 15px;
      //padding-bottom: 32px;
    }

    .goto {
      position: absolute;
      right: 0;
      bottom: 0;
      margin-right: 11px;
      margin-bottom: 14px;
      //margin-bottom: 1px;
    }

    select.dashboard {
      text-align-last: center;
      padding-left: 24px;
      margin-bottom: 7px;
    }

    .kinds {
      padding-bottom: 16px;
      //padding-right: 16px;
      padding-left: 2px;

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
            white-space: nowrap;

            &:hover {
              text-decoration: underline;
            }
          }
        }
      }
    }
    .filters {
      select,
      input {
        margin-bottom: 10px;
      }
      #filter-message,
      #filter-regexp {
        display: block;
      }
    }
  }

  &.head-orient {
    .customs {
      position: absolute;
      right: 15px;
      top: 15px;
      display: flex;
      flex-direction: row-reverse;
    }

    .goto {
      position: absolute;
      right: 14px;
      //top: 49px;
      top: 43px;
    }

    .kinds {
      /*text-align: center;*/
      /*margin-left: 26px;*/
      .kindblock {
        display: inline-block;
        margin: 8px 15px;
        margin-left: 5px;

        .kindname {
          a {
            font-weight: bold;
            text-decoration: none;
            &:hover {
              text-decoration: underline;
            }
          }
        }

        .keynames {
          display: none;
        }
      }
    }

    .filters {
      padding-top: 7px;
      line-height: 35px;

      select,
      input {
        max-width: 180px;
        margin-right: 8px;
      }

      #filter-agg {
        float: inherit;
      }

      #filter-message,
      #filter-regexp {
        margin-right: 8px;
      }
    }
  }

  &.fullscreen {
    .content {
      padding-left: 34px;
    }
    .avatar {
      box-shadow: 0 0 0 2px #fff;
      margin-left: -7px;
    }
    &.night .avatar {
      box-shadow: 0 0 0 1px #000;
    }
  }
}
</style>
