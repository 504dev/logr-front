<template>
  <modal v-bind="$attrs" width="480">
    <div class="modal-body">
      <p class="title">«{{ dash.name }}»</p>
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
        <input type="text" v-model="search" class="search selected" placeholder="type username" /><img
          :src="`https://github.com/${search}.png?size=64`"
          v-if="!disabled"
        /><button class="add selected" :disabled="disabled">
          Add member
        </button>
      </form>
    </div>
  </modal>
</template>

<script>
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
      const already = this.dash.members.find(v => v.user.username === this.search)
      if (already) {
        return true
      }
      return false
    }
  },
  methods: {
    async addMember() {
      let username = this.search
      try {
        const { data } = await this.$store.dispatch(ACTIONS.MEMBER_ADD, { dashId: this.dash.id, username })
        console.log(data)
        this.dash.members.push(data)
        this.search = ''
      } catch (e) {
        console.error(e.response)
        switch (e.response.status) {
          case 404:
            return alert(`User «${this.dash.name}» not found`)
          default:
            return alert(e)
        }
      }
    },
    async removeMember(member) {
      console.log(member)
      if (confirm(`Remove user «${member.user.username}» from «${this.dash.name}» members?`)) {
        try {
          const data = await this.$store.dispatch(ACTIONS.MEMBER_REMOVE, { dashId: this.dash.id, id: member.id })
          console.log(data)
        } catch (e) {
          console.error(e)
          //
        }
        this.dash.members = this.dash.members.filter(v => v !== member)
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
      &:disabled {
        cursor: not-allowed;
        background-color: #888;
        border-color: #444;
      }
    }
  }
}
</style>