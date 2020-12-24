<template>
  <modal v-bind="$attrs" width="480">
    <div class="modal-body">
      <p class="title">{{ dash.name }}</p>
      <div class="team">
        <div v-for="member in dash.members" :key="member.id" class="member">
          <span class="remove" @click="removeMember(member)">
            <img
              :src="`https://avatars.githubusercontent.com/u/${member.user.github_id}`"
              :title="member.user.username"
              :key="member.user_id"
              class="avatar"
            />
            <font-awesome-icon icon="times-circle" title="remove" />
          </span>
          {{ member.user.username }}
        </div>
      </div>
      <form @submit.prevent="addMember()">
        <input
          type="text"
          :value="search"
          @input="debounceSearch"
          class="search selected"
          placeholder="type username"
        /><img v-if="!disabled" :src="`${match.avatar_url}?size=64`" /><button
          class="add selected"
          :disabled="disabled"
        >
          Add member
        </button>
      </form>
    </div>
  </modal>
</template>

<script>
import _ from 'lodash'
import axios from 'axios'
import { mapState } from 'vuex'
import ACTIONS from '../store/action-types'

export default {
  props: {
    dash: Object
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
    }
  },
  methods: {
    debounceSearch: _.debounce(async function(e) {
      this.search = e.target.value
      const { data } = await axios(`https://api.github.com/users/${this.search}`).catch(() => ({ data: null }))
      this.match = data
    }, 500),
    async addMember() {
      let username = this.search
      try {
        const data = await this.$store.dispatch(ACTIONS.MEMBER_ADD, { dash: this.dash, username })
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
      if (confirm(`Remove ${member.user.username} member?`)) {
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
  padding: 10px;
  .title {
    font-weight: bold;
  }
  .team {
    margin-top: 20px;
    .member {
      box-sizing: border-box;
      display: inline-block;
      width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      padding-right: 20px;
      line-height: 24px;
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
          border-radius: 100%;
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
    margin-top: 16px;
    input.search {
      width: 320px;
      max-width: none;
    }
    img {
      width: 16px;
      height: 16px;
      border-radius: 16px;
      margin: 6px;
      margin-left: -24px;
      border: solid 1px #000;
    }
    button.add {
      width: 120px;
      margin-left: 8px;
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
