<template>
  <modal v-bind="$attrs" width="480" height="340">
    <div class="modal-body">
      <p class="title">{{ dash.name }}</p>
      <select v-model="lang" class="selected">
        <option :value="opt" v-for="opt in options" :key="opt">{{ opt }}</option>
      </select>
      <highlight v-for="key in dash.keys" :key="key.public_key" class="keys" :code="code[lang]" lang="javascript" />
    </div>
  </modal>
</template>

<script>
import { mapState } from 'vuex'
import ACTIONS from '../store/action-types'
import Highlight from './Highlight'

export default {
  components: {
    Highlight
  },
  props: {
    dash: Object
  },
  data() {
    const options = ['plain', 'javascript', 'golang', 'python', 'php']
    return {
      options,
      lang: options[1],
      search: '',
      match: null
    }
  },
  computed: {
    code() {
      const key = this.dash.keys[0]
      const plain = `\
/* public key */
${key.public_key}

/* private key */
${key.private_key}
`
      const javascript = `\
const { Logr } = require('logr-node-client');

const conf = new Logr({
  udp: ':7776',
  publicKey: '${key.public_key}',
  privateKey: '${key.private_key}',
});

const logr = conf.newLogger('hello.log');

logr.info('Hello, Logr!');`
      const golang = `\
import logrc "github.com/504dev/logr-go-client"

func main() {
    conf := logrc.Config{
        Udp:        ":7776",
        PublicKey:  "${key.public_key}",
        PrivateKey: "${key.private_key}",
    }
    logr, _ = conf.NewLogger("hello.log")

    logr.Info("Hello, Logr!")
}`
      const python = `\
from logrpy import Logr

conf = Logr(
    ('127.0.0.1', 7776),
    '${key.public_key}',
    '${key.private_key}',
)

logr = conf.getlogger('hello.log')

logr.info('Hello, Logr!')`
      const php = `\
$conf = new Logr(
    ':7776',
    '${key.public_key}',
    '${key.private_key}'
);

$logr = $conf->getLogger('hello.log');

$logr->info('Hello, Logr!');`
      return { plain, javascript, golang, python, php }
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-body {
  position: relative;
  padding: 10px;
  .title {
    font-weight: bold;
  }
  select {
    position: absolute;
    right: 10px;
    top: 22px;
  }
  .keys {
    font-size: 13px;
    margin-top: 10px;
    padding: 10px;
    border-radius: 4px;
    height: 245px;
  }
}
</style>
