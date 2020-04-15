<template>
  <div class="dashboard">
    <router-link :to="`/dashboard/${dash.id}/logs`">
      <h3>{{ dash.name }}</h3>
    </router-link>
    <span @click="onShare">
      <i class="icons fas fa-share"></i>
    </span>
    <span @click="onDelete(dash)">
      <i class="icons fas fa-trash-alt"></i>
    </span>
    <span @click="onKeys(dash)">
      <i class="icons fas fa-key"></i>
    </span>
  </div>
</template>

<script>
export default {
  props: {
    dash: Object
  },
  data () {
    return {
      //
    }
  },
  computed: {
    //
  },
  methods: {
    onShare () {
      const username = prompt('Enter @username to share:')
      alert(username)
    },
    onDelete (dash) {
      const confirm = prompt('Enter dash name for delete:')
      if (confirm === dash.name) {
        alert('Deleted')
      }
    },
    onKeys (dash) {
      console.log(dash)
      alert(`key:\n${dash.public_key}\n\nsecret:\n${dash.private_key}`)
    }
  }
}
</script>

<style scoped>
  .dashboard {
    text-decoration: none;
    display: inline-block;
    width: 200px;
    height: 100px;
    background-color: #cccccc;
    margin: 0 20px 20px 0;
    padding: 10px;
    border-radius: 4px;
  }
  .icons {
    cursor: pointer;
    margin: 5px;
  }
</style>
