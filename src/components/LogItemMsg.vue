<template>
  <span>
    <span v-for="({ text, css, json, match }, key) in chunks"
      :key="key"
      :tabindex="json && 0"
      :style="css"
      :class="{ chunk: true, json, match }"
    >{{ json ? JSON.stringify(json, null, 2) : text }}</span>
  </span>
</template>

<script>
import _ from 'lodash'
import ansicolor from 'ansicolor'

export default {
  props: {
    value: String
  },
  data () {
    return {
      filter: this.$attrs.filter
    }
  },
  computed: {
    chunks () {
      const result = []
      let { spans } = ansicolor.parse(this.value)

      _.each(spans, span => {
        if (span.css) {
          result.push(span)
          return
        }
        const matches = this.search(span.text)
        _.each(matches, item => {
          if (item.match) {
            result.push(item)
            return
          }
          const jsons = this.json(item.text)
          result.push(...jsons)
        })
      })

      return result
    }
  },
  methods: {
    search (text) {
      if (!this.filter) {
        return [{ text }]
      }
      const regex = new RegExp(this.filter, 'g')
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
    background-color: yellow;
  }
  .json {
    border-bottom: 1px dotted purple;
    white-space: normal;
    outline: none;
    &:focus {
      white-space: pre;
      border-bottom: none;
    }
  }
</style>
