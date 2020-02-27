<template>
  <span class="log-item">
    <span class="log-logname ellipsis tag">{{ value.logname }}</span>
    <span class="log-hostname ellipsis tag">{{ value.hostname }}</span>
    <span class="log-time">{{ new Date(value.timestamp / 1000000).toISOString() }}</span>
    <span class="log-level ellipsis">{{ value.level }}</span>
    <span class="log-message">
      <span v-for="(chunk, key) in colorMessage" :key="key" :style="chunk.css"><span
        v-for="(item, key) in chunk.json" :key="key" :class="{ json: !!item.json }"
      >{{ item.json ? JSON.stringify(item.json, null, 2) : item.text }}</span
      ></span>
    </span>
  </span>
</template>

<script>
import ansicolor from 'ansicolor'

export default {
  props: {
    value: Object
  },
  computed: {
    colorMessage () {
      const parsed = ansicolor.parse(this.value.message)
      return parsed.spans.map(item => {
        item.json = this.json(item.text)
        return item
      })
    }
  },
  methods: {
    json (text) {
      const borders = {
        '{': '}',
        '[': ']'
      }
      const chunks = []
      let tmp = ''
      for (let i = 0; i < text.length; i++) {
        const s = text[i]
        tmp += s
        if (s === '{' || s === '[') {
          const right = borders[s]
          for (let j = i + 1; j < text.length; j++) {
            const s2 = text[j]
            if (s2 === right) {
              const test = text.slice(i, j + 1)
              if (test.length <= 2) {
                continue
              }
              try {
                const json = JSON.parse(test)
                tmp = tmp.slice(0, -1)
                if (tmp) {
                  chunks.push({ text: tmp })
                  tmp = ''
                }
                chunks.push({ text: test, json })
                i = j + 1
                break
              } catch (e) {
                //
              }
            }
          }
        }
      }
      if (tmp) {
        chunks.push({ text: tmp })
      }
      return chunks
    }
  }
}
</script>

<style scoped>
  .json {
    border-bottom: 1px dashed purple;
    white-space: normal;
  }
  .ellipsis {
    display: inline-block;
    text-overflow: ellipsis;
    overflow: hidden;
  }
  .tag {
    display: inline-block;
    /*margin: 0 5px;*/
    padding: 0 5px;
    background-color: #eeeeee;
    border-radius: 2px;
  }
  .log-item {
    display: block;
    white-space: nowrap;
  }
  .log-time {
    color: #cccccc
  }
  .log-level {
    color: green;
    width: 50px;
  }
  .log-logname {
    width: 60px;
  }
  .log-hostname {
    width: 60px;
  }
  .log-message {
    white-space: pre;
  }
</style>
