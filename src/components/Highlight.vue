<template>
  <prism :language="lang">{{ code }}</prism>
</template>

<script>
import 'prismjs'
import 'prismjs/themes/prism.css'
import Prism from 'vue-prism-component'

export default {
  components: {
    Prism
  },
  props: {
    lang: String,
    code: String
  }
}
</script>
