<template>
  <span
    ><span v-for="({ text, css, json, match }, key) in chunks" :key="key" :style="css" :class="{ chunk: true, match }"
      ><template v-if="json"
        ><counter-widget
          v-if="json.widget === 'counter'"
          v-bind="json"
          :dashId="dashId"
          :timestamp="timestamp"
        ></counter-widget
        ><span v-else :tabindex="json && 0" class="json">{{ JSON.stringify(json, null, 2) }}</span></template
      ><template v-else>{{ text }}</template></span
    ></span
  >
</template>

<script>
import _each from 'lodash/each'
import ansicolor from 'ansicolor'
import CounterWidget from './CounterWidget.vue'

export default {
  components: { CounterWidget },
  props: {
    value: String,
    filter: String,
    timestamp: String
  },
  data() {
    return {
      // filter: this.$attrs.filter
    }
  },
  computed: {
    dashId() {
      return +this.$route.params.id
    },
    chunks() {
      const result = []
      let { spans } = ansicolor.parse(this.value)

      _each(spans, span => {
        const matches = this.search(span.text).map(v => ({ ...span, ...v }))
        _each(matches, item => {
          if (item.match) {
            result.push(item)
            return
          }
          const jsons = this.json(item.text).map(v => ({ ...item, ...v }))
          result.push(...jsons)
        })
      })

      return result
    }
  },
  methods: {
    search(text) {
      if (!this.filter) {
        return [{ text }]
      }
      let regex
      try {
        regex = new RegExp(this.filter, 'g')
      } catch (e) {
        console.error(e)
        return [{ text }]
      }
      const parts = []
      let matches
      let lastIndex = 0
      while ((matches = regex.exec(text)) !== null) {
        const [match] = matches
        const start = regex.lastIndex - match.length
        if (start > lastIndex) {
          parts.push({ text: text.slice(lastIndex, start) })
        }
        parts.push({ text: text.slice(start, regex.lastIndex), match: true })
        lastIndex = regex.lastIndex
      }
      parts.push({ text: text.slice(lastIndex) })
      return parts
    },
    json(text) {
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
                if (tmp.length > 1) {
                  chunks.push({ text: tmp })
                  tmp = ''
                }
                chunks.push({ text: test, json })
                i = j
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

<style lang="scss" scoped>
.--chunk {
  border-radius: 5px;
  border-style: solid;
  border-width: 0 2px;
  border-color: orange;
}
.match {
  background-color: #dc0 !important;
  color: black;
}
.json {
  border-bottom: 1px dotted mediumpurple;
  white-space: nowrap;
  outline: none;
  &:focus {
    white-space: pre;
    border-bottom: none;
  }
}
</style>
