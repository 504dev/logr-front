<template>
  <table
    :class="{
      fullscreen,
      'left-orient': !orient,
      'head-orient': orient
    }"
    v-if="this.user && this.dash"
  >
    <tr v-show="orient && !fullscreen">
      <td class="header">
        <router-link to="/dashboards"
          ><img class="avatar" :src="`https://avatars.githubusercontent.com/u/${user.github_id}`"
        /></router-link>
        <select :value="dashId" class="dashname" @change="onDashChange">
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
      <td class="lefter" v-show="!orient && !fullscreen">
        <router-link to="/dashboards"
          ><img class="avatar" :src="`https://avatars.githubusercontent.com/u/${user.github_id}`"
        /></router-link>
        <select :value="dashId" class="dashname" @change="onDashChange">
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
          <spinner size="2x" v-if="loading" />
          <slot v-else name="content"></slot>
        </div>
        <router-link to="/dashboards" v-if="fullscreen"
          ><img class="avatar" :src="`https://avatars.githubusercontent.com/u/${user.github_id}`"
        /></router-link>
        <span class="arrow" :class="arrowDirection" @click="onFull"></span>
      </td>
    </tr>
  </table>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import MUTATIONS from '../store/mutations-types.js'
import Spinner from '../components/Spinner'

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
    }
  },
  methods: {
    onFull() {
      this.$store.commit(MUTATIONS.SWITCH_FULL)
    },
    onDashChange(e) {
      const id = e.target.value
      this.$router.push({ params: { ...this.$route.params, id } })
      location.reload()
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

  &.reverse {
    .content {
      display: flex;
      flex-direction: column-reverse;
    }
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
        padding-bottom: 110px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        z-index: 800;

        .customs {
          display: inline-block;
          position: absolute;
          left: 0;
          bottom: 0;
          padding: 10px;
          padding-bottom: 15px;

          a {
            margin-right: 4px;
          }
        }

        .goto {
          font-size: smaller;
          position: absolute;
          right: 0;
          bottom: 0;
          margin-right: 10px;
          margin-bottom: 17px;
        }
      }

      &.header {
        padding: 10px 75px 5px 10px;
        height: 30px;
        background-color: #ddd;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        z-index: 800;

        .customs {
          position: absolute;
          right: 15px;
          top: 15px;
          display: flex;
          flex-direction: row-reverse;

          a {
            margin-left: 4px;
          }
        }

        .goto {
          font-size: smaller;
          position: absolute;
          right: 15px;
          top: 55px;
        }
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
  }

  &.fullscreen {
    &.left-orient .content {
      padding-left: 30px;
    }

    &.head-orient .content {
      padding-top: 30px;
    }
  }

  &.left-orient {
    .filters {
      select,
      input {
        margin-bottom: 10px;
      }

      #filter-regexp {
        width: 180px;
        margin-bottom: 10px;
      }

      #filter-message {
        width: 180px;
        margin-bottom: 10px;
      }
    }
    select.dashname {
      text-align-last: center;
      padding-left: 24px;
      margin-bottom: 7px;
    }
  }

  &.head-orient {
    .filters {
      padding-top: 7px;
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

      #filter-message {
        margin-right: 8px;
        width: 200px;
      }

      #filter-regexp {
        margin-right: 8px;
        width: 200px;
      }
    }
  }

  select.dashname {
    margin-top: 2px;
    border: none;
    background: none;
    color: #111;
    font-weight: bold;
    font-size: 16px;
    padding-left: 32px;
  }

  .arrow {
    display: block;
    color: #fff;
    position: absolute;
    z-index: 900;
    top: 0;
    left: 0;
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
      top: 50%;
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
    top: 12px;
    left: 10px;
    width: 24px;
    height: 24px;
    border-radius: 24px;
    border: solid 1px black;
    /*box-shadow: 0 0 0 1px #000;*/

    &:hover {
      box-shadow: 0 0 0 1px #9e9;
    }
  }

  &.fullscreen {
    &.left-orient {
      .avatar {
        margin-left: -16px;
      }
    }
    &.head-orient {
      .avatar {
        margin-top: -16px;
      }
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
        margin: 8px 15px;
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
