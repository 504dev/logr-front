<template>
  <VueFinalModal
    v-bind="$attrs"
    overlay-transition="vfm-fade"
    content-transition="vfm-fade"
    @opened="focus"
  >
    <div class="modal-body">
      <p class="title">{{ dash.name }}</p>
      <form @submit.prevent="addMember()">
        <input
          ref="search"
          type="text"
          :value="search"
          @input="debounceSearch"
          class="search selected"
          placeholder="Enter username"
        /><img v-if="!disabled" :src="`${match.avatar_url}?size=64`" /><button
        class="add selected"
        :disabled="disabled"
      >
        Add member
      </button>
      </form>
      <div class="team">
        <div
          v-for="member in membersSorted"
          :key="member.id"
          class="member"
          :class="{ invited: !member.user.login_at }"
          :title="member.user.username"
        >
          <span class="remove" @click="removeMember(member)">
            <img
              :src="`https://avatars.githubusercontent.com/u/${member.user.github_id}`"
              :key="member.user_id"
              class="avatar"
            />
            <FontAwesomeIcon
              icon="times-circle"
              :title="member.user.login_at ? 'remove membership' : 'remove invition'"
            />
          </span>
          <FontAwesomeIcon icon="envelope-open-text" title="invited" class="invition" />
          {{ member.user.username }}
        </div>
      </div>
    </div>
  </VueFinalModal>
</template>

<script>
import { mapState } from 'vuex'
import { VueFinalModal } from 'vue-final-modal'
import _sortBy from 'lodash/sortBy'
import _debounce from 'lodash/debounce'
import ACTIONS from '@/store/action-types'

export default {
  props: {
    dash: Object
  },
  components: {
    VueFinalModal,
  },
  data() {
    return {
      search: '',
      match: null
    }
  },
  computed: {
    ...mapState(['user']),
    disabled() {
      if (this.search.length < 3) {
        return true
      }
      if (this.search === this.user.username) {
        return true
      }
      if (this.dash.members.find(v => v.user.username === this.search)) {
        return true
      }
      return !this.match
    },
    membersSorted() {
      return _sortBy(this.dash.members, 'user.login_at')
    }
  },
  methods: {
    focus() {
      this.$refs.search.focus()
    },
    debounceSearch: _debounce(async function(e) {
      this.search = e.target.value
      const response = await fetch(`https://api.github.com/users/${this.search}`)
      this.match = response.ok ? await response.json() : null
    }, 500),
    async addMember() {
      try {
        const data = await this.$store.dispatch(ACTIONS.MEMBER_ADD, { dash: this.dash, member: this.match })
        this.search = ''
        console.log('addMember', data)
      } catch (e) {
        console.error(e)
        switch (e.response.status) {
          case 404:
            return alert(`User ${this.dash.name} not found`)
          default:
            return alert(e)
        }
      }
    },
    async removeMember(member) {
      console.log(member)
      if (confirm(`Remove ${member.user.username} ${member.user.login_at ? 'membership' : 'invition'}?`)) {
        try {
          const data = await this.$store.dispatch(ACTIONS.MEMBER_REMOVE, { dash: this.dash, id: member.id })
          console.log('removeMember', data)
        } catch (e) {
          console.error(e)
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-body {
  //padding: 10px;
  .title {
    font-weight: bold;
  }
  .team {
    /*text-align: center;*/
    margin-top: 16px;
    padding-left: 8px;
    line-height: 32px;
    .member {
      position: relative;
      box-sizing: border-box;
      display: inline-block;
      width: 115px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding-right: 20px;
      line-height: 24px;
      .invition {
        display: none;
        font-size: 10px;
        position: absolute;
        left: 12px;
        bottom: 0;
        background-color: white;
        border-radius: 100%;
        pointer-events: none;
      }
      &.invited {
        opacity: 0.6;
        .invition {
          display: inline-block;
        }
      }
      .remove {
        display: inline-block;
        width: 20px;
        height: 20px;
        text-align: center;
        overflow: hidden;
        cursor: pointer;
        margin-bottom: -4px;
        img {
          box-sizing: border-box;
          border: solid 1px black;
          border-radius: 50%;
          width: 100%;
          height: 100%;
        }
        svg {
          display: none;
          width: 100%;
          height: 100%;
        }
        &:hover {
          img {
            display: none;
          }
          svg {
            display: inline-block;
          }
        }
      }
    }
  }
  form {
    margin-top: 20px;
    overflow: hidden;
    input.search {
      width: 360px;
      max-width: none;
      padding-right: 25px;
    }
    img {
      width: 16px;
      height: 16px;
      border-radius: 16px;
      margin: 6px 0 0 -24px;
      border: solid 1px #000;
      /*box-shadow: 0 0 0 1px black;*/
    }
    button.add {
      width: 170px;
      /*margin-left: 8px;*/
      float: right;
      background-color: #080;
      border-color: #040;
      color: white;
      cursor: pointer;
      &:disabled {
        cursor: not-allowed;
        background-color: #888;
        border-color: #444;
      }
    }
  }
}
</style>
