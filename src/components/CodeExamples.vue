<template>
  <div class="codes">
    <select v-model="mutValue" class="selected" @change="onChange">
      <option :value="opt" v-for="opt in options" :key="opt">{{ opt }}</option>
    </select>
    <prism class="keys" language="javascript">{{ code[mutValue] }}</prism>
  </div>
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
    keys: Object,
    options: { type: Array, default: () => ['yml', 'javascript', 'golang', 'python', 'php'] },
    value: { type: String, default: 'javascript' }
  },
  data() {
    const mutValue = this.value
    return {
      mutValue
    }
  },
  methods: {
    onChange(e) {
      this.$emit('input', e.target.value)
    }
  },
  computed: {
    code() {
      const { public_key, private_key } = this.keys
      const yml = `\
logr:
  udp: "${location.hostname}:7776"
  public_key: "${public_key}"
  private_key: "${private_key}"
`
      const javascript = `\
const { Logr } = require('logr-node-client');

const conf = new Logr({
  udp: '${location.hostname}:7776',
  publicKey: '${public_key}',
  privateKey: '${private_key}',
});

const logr = conf.newLogger('hello.log');

logr.info('Hello, Logr!');`
      const golang = `\
import logrc "github.com/504dev/logr-go-client"

func main() {
    conf := logrc.Config{
        Udp:        "${location.hostname}:7776",
        PublicKey:  "${public_key}",
        PrivateKey: "${private_key}",
    }
    logr, _ := conf.NewLogger("hello.log")

    logr.Info("Hello, Logr!")
}`
      const python = `\
from logrpy import Logr

conf = Logr(
    ('${location.hostname}', 7776),
    '${public_key}',
    '${private_key}',
)

logr = conf.getlogger('hello.log')

logr.info('Hello, Logr!')`
      const php = `\
$conf = new Logr(
    '${location.hostname}:7776',
    '${public_key}',
    '${private_key}'
);

$logr = $conf->getLogger('hello.log');

$logr->info('Hello, Logr!');`
      return { yml, javascript, golang, python, php }
    }
  }
}
</script>

<style lang="scss" scoped>
.codes {
  /*outline: dashed 1px red;*/
  select {
    /*float: right;*/
    margin-bottom: 10px;
    width: 120px;
  }
  .keys {
    background-color: #fff;
    box-sizing: border-box;
    font-size: 13px;
    padding: 10px;
    border-radius: 6px;
    width: 100%;
    height: 265px;
    margin: 0;
    outline: solid 1px #e4e2e0;
  }
}
</style>
