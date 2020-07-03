<template>
  <div class="wrapper" v-if="this.user && this.dash">
    <table>
      <tr>
        <td class="header">
          <router-link to="/dashboards"
            ><img class="avatar" :src="`https://avatars0.githubusercontent.com/u/${user.github_id}`"
          /></router-link>
          <div class="filters">
            <slot name="filters"></slot>
          </div>
        </td>
      </tr>
      <tr>
        <td class="container">
          <span v-if="loading">Loading...</span>
          <slot v-else name="content"></slot>
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
import store from 'store2'
import { mapState } from 'vuex'

export default {
  props: {
    loading: Boolean
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
    table {
      background-color: #000;
      color: white;
    }
  }
  table {
    border-spacing: 0;
    height: 100%;
    width: 100%;
    td {
      padding: 0;
      margin: 0;
      /*border: dashed 1px red;*/
      vertical-align: top;
      &.header {
        box-sizing: border-box;
        /*position: fixed;*/
        /*padding: 10px;*/
        /*height: 60px;*/
        width: 100%;
        background-color: rgba(224, 224, 224, 0.9);
        z-index: 901;

        .avatar {
          position: absolute;
          width: 24px;
          height: 24px;
          border-radius: 24px;
          border: solid 1px transparent;
          &:hover {
            border-color: green;
          }
        }

        .filters {
          padding-left: 32px;
          box-sizing: content-box;
          display: inline-block;
          select,
          input {
            background-color: white;
            box-sizing: border-box;
            display: inline-block;
            margin: 0;
            width: 100%;
            height: 30px;
            padding: 0 10px;
            border: solid 1px #999;
            border-bottom-width: 2px;
          }
          input:focus {
            outline: none;
            border-bottom: solid 2px green;
          }
        }
      }
      &.container {
        font-family: Courier;
        font-size: 14px;
        /*position: absolute;*/
        height: 100%;
        width: 100%;
        padding: 0 10px 10px 32px;
        box-sizing: border-box;
        overflow: scroll;
        z-index: 900;
      }
    }
  }
}
</style>
