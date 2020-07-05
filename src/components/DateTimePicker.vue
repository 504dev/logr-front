<template>
  <div>
    <div class="container">
      <span class="icon date" @click="openDatePicker"><i class="fas fa-calendar"></i></span
      ><input
        ref="idate"
        type="text"
        :placeholder="TODAY"
        :class="{ date: true, invalid: isDateInvalid }"
        :value="input.date"
        @change="onDateInput"
        maxlength="10"
      /><span class="icon time" @click="openTimePicker"><i class="fas fa-clock"></i></span
      ><input
        ref="itime"
        type="text"
        :placeholder="ZERO_TIME"
        :class="{ time: true, invalid: isTimeInvalid }"
        :value="input.time"
        @change="onTimeInput"
        maxlength="5"
      />
    </div>
    <datetime type="date" :value="picker.date" zone="UTC" input-class="datetime-hidden" ref="sdate" @input="onDatePick">
    </datetime>
    <datetime type="time" :value="picker.time" zone="UTC" input-class="datetime-hidden" ref="stime" @input="onTimePick">
    </datetime>
  </div>
</template>

<script>
import { Datetime } from 'vue-datetime'

const TODAY = new Date().toISOString().slice(0, 10)
const ZERO_TIME = '00:00'

export default {
  components: { Datetime },
  props: ['value'],
  data() {
    return {
      TODAY,
      ZERO_TIME
    }
  },
  created() {
    //
  },
  computed: {
    datetime() {
      return this.value ? new Date(this.value).toISOString() : null
    },
    picker() {
      return { date: this.datetime, time: this.datetime }
    },
    input() {
      let date = ''
      let time = ''
      if (this.value) {
        date = this.datetime.slice(0, 10)
        time = this.datetime.slice(11, 16)
        if (time === ZERO_TIME) {
          time = ''
        } else if (date === new Date().toISOString().slice(0, 10)) {
          date = ''
        }
      }
      return { date, time }
    },
    isDateInvalid() {
      return this.input.date ? isNaN(this.test(this.input.date, ZERO_TIME)) : false
    },
    isTimeInvalid() {
      return this.input.time ? isNaN(this.test(TODAY, this.input.time)) : false
    }
  },
  methods: {
    onDatePick(date) {
      if (this.$el) {
        const timestamp = this.test(date.slice(0, 10), this.input.time)
        if (isNaN(timestamp)) {
          return
        }
        this.$emit('input', timestamp)
        const target = this.$refs.idate
        target.blur()
        target.focus()
        this.$el.dispatchEvent(new Event('change', { target, bubbles: true }))
      }
    },
    onTimePick(time) {
      if (this.$el) {
        const timestamp = this.test(this.input.date, time.slice(11, 16))
        if (isNaN(timestamp)) {
          return
        }
        this.$emit('input', timestamp)
        const target = this.$refs.itime
        target.blur()
        target.focus()
        this.$el.dispatchEvent(new Event('change', { target, bubbles: true }))
      }
    },
    onDateInput(e) {
      const timestamp = this.test(e.target.value, this.input.time)
      if (isNaN(timestamp)) {
        e.stopPropagation()
        return
      }
      this.$emit('input', timestamp)
    },
    onTimeInput(e) {
      const timestamp = this.test(this.input.date, e.target.value)
      if (isNaN(timestamp)) {
        e.stopPropagation()
        return
      }
      this.$emit('input', timestamp)
    },
    openDatePicker() {
      this.$refs.sdate.$el.firstElementChild.click()
    },
    openTimePicker() {
      this.$refs.stime.$el.firstElementChild.click()
    },
    test(date, time) {
      if (date === '' && time === '') {
        return 0
      }
      date = date || TODAY
      time = time || ZERO_TIME
      return +new Date(`${date}T${time}:00.000Z`)
    }
  }
}
</script>
<style scoped lang="scss">
div.container {
  box-sizing: border-box;
  position: relative;
  display: inline-block;
  white-space: nowrap;
  height: 30px;
  padding: 0;
  margin: 2px 0;
  width: 100%;
  overflow: hidden;

  span.icon {
    position: absolute;
    display: inline-block;
    margin-top: 4px;
    margin-left: -25px;
    cursor: pointer;
    color: #ccc;
    &:hover {
      color: #333;
    }
    &.date {
      left: 60%;
    }
    &.time {
      left: 100%;
    }
  }

  > input {
    box-sizing: border-box;
    display: inline-block;
    border: solid 1px #999;
    border-bottom-width: 2px;
    margin: 0;
    padding: 0 0 0 10px;
    height: 100%;
    &.date {
      width: 60%;
      border-right: none;
      border-radius: 4px 0 0 4px;
    }
    &.time {
      width: 40%;
      border-left: dashed 1px #999;
      border-radius: 0 4px 4px 0;
    }
    &:focus {
      outline: none;
      border-bottom: solid 2px green;
    }
    &.invalid,
    &.invalid:focus {
      border-bottom: solid 2px red;
    }
  }
}
</style>
<style>
.datetime-hidden {
  display: none;
}
</style>
