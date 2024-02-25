<template>
  <div class="support">
    <div class="text">
      <p>* If you have found a bug or have a feature request you can <a href="https://github.com/504dev/logr/issues">leave an issue on github</a>.</p>
      <p>* If you have another question you can ask it through the form below.</p>
    </div>
    <form @submit.prevent="onSubmit">
      <input required minlength="2" type="text" placeholder="Your Name" v-model="form.name" />
      <input required type="email" placeholder="Email" v-model="form.email" />
      <textarea required autofocus maxlength="1000" placeholder="Your Message" v-model="form.message"></textarea>
      <input type="submit" value="Send" class="submit" />
      <div class="success" v-show="success">
        <font-awesome-icon icon="check" />
      </div>
    </form>
  </div>
</template>


<script>
import axios from 'axios'

export default {
  data() {
    return {
      success: false,
      form: {
        name: '',
        email: '',
        message: '',
      }
    }
  },
  methods: {
    async onSubmit() {
      await axios.post('/support', this.form)
      this.form = { name: '', email: '', message: '' }
      this.success = true
      setTimeout(() => this.success = false, 2_000)
    }
  }
}
</script>

<style lang="scss">
body {
  background-color: #f4f2f0;
}
.support {
  font-family: Courier, monospace;
  //font-size: 13px;
  width: 800px;
  padding: 40px;
  > .text {
    font-size: 13px;
    margin-bottom: 40px;
  }
  > form {
    position: relative;
    > * {
      display: block;
      margin-bottom: 8px;
    }
    > textarea {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      width: 100%;
      height: 300px;
      padding: 8px;
      border-radius: 4px;
      box-sizing: border-box;
    }
    > .submit {
      cursor: pointer;
      background-color: #ccc;
    }
    > .success {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: #f4f2f0;
      color: #e4e2e0;
      text-align: center;
      > svg {
        font-size: 256px;
        margin-top: 128px;
      }
    }
  }
}
</style>
