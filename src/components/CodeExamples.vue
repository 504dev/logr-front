<template>
  <div class="codes">
    <select v-model="selectedOption" class="selected" @change="onChange">
      <option :value="opt" v-for="opt in options" :key="opt">{{ opt }}</option>
    </select>
    <copy-to-clipboard :text="code[selectedOption]" class="copy" />
    <prism class="keys" language="javascript" :key="selectedOption">{{ code[selectedOption] }}</prism>
  </div>
</template>

<script>
import { defineComponent, computed, ref } from 'vue'
import 'prismjs'
import 'prismjs/themes/prism.css'
import CopyToClipboard from '@/components/CopyToClipboard.vue'
import Prism from 'vue-prism-component'

export default defineComponent({
  components: {
    Prism,
    CopyToClipboard,
  },
  props: {
    keys: Object,
    options: { type: Array, default: () => ['yml', 'javascript', 'golang', 'python', 'php'] },
    modelValue: { type: String, default: 'javascript' }
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const selectedOption = ref(props.modelValue)

    const onChange = (e) => {
      emit('update:modelValue', e.target.value)
    }

    const code = computed(() => {
      const { public_key, private_key } = props.keys
      return {
        yml: `\
logr:
  udp: "${location.hostname}:7776"
  public_key: "${public_key}"
  private_key: "${private_key}"
`,
        javascript: `\
const { Logr } = require('logr-node-client');

const conf = new Logr({
  udp: '${location.hostname}:7776',
  publicKey: '${public_key}',
  privateKey: '${private_key}',
});

const logr = conf.newLogger('hello.log');

logr.info('Hello, Logr!');`,
        golang: `\
import logrc "github.com/504dev/logr-go-client"

func main() {
    conf := logrc.Config{
        Udp:        "${location.hostname}:7776",
        PublicKey:  "${public_key}",
        PrivateKey: "${private_key}",
    }
    logr, _ := conf.NewLogger("hello.log")

    logr.Info("Hello, Logr!")
}`,
        python: `\
from logrpy import Logr

conf = Logr(
    ('${location.hostname}', 7776),
    '${public_key}',
    '${private_key}',
)

logr = conf.getlogger('hello.log')

logr.info('Hello, Logr!')`,
        php: `\
$conf = new Logr(
    '${location.hostname}:7776',
    '${public_key}',
    '${private_key}'
);

$logr = $conf->getLogger('hello.log');

$logr->info('Hello, Logr!');`
      }
    })

    return {
      selectedOption,
      onChange,
      code
    }
  }
})
</script>

<style lang="scss" scoped>
.codes {
  position: relative;
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
  .copy {
    position: absolute;
    top: 50px;
    right: 10px;
  }
}
</style>
