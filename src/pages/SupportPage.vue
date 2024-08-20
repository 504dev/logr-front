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
      <vue-recaptcha
        ref="recaptcha"
        size="invisible"
        sitekey="6Ld2qn8pAAAAAM7lcXJ99sLdm4NQXXP2L_4gm8ht"
        @verify="onVerify"
        @expired="onCaptchaExpired"
      ></vue-recaptcha>
      <input type="submit" value="Send" class="submit" />
      <div class="success" v-show="success">
        <FontAwesomeIcon icon="check" />
      </div>
    </form>
  </div>
</template>


<script>
import { VueRecaptcha } from 'vue-recaptcha'

export default {
  components: {
    VueRecaptcha,
  },
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
    onSubmit() {
      this.$refs.recaptcha.execute()
    },
    async onVerify(recaptchaToken) {
      console.log({ recaptchaToken })

      const response = await fetch('/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...this.form, recaptchaToken })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.form = { name: '', email: '', message: '' }
      this.success = true
      setTimeout(() => this.success = false, 2_000)
    },
    onCaptchaExpired () {
      this.$refs.recaptcha.reset()
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
