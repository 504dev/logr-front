<template>
  <div>
    <div class="container">
      <span class="icon date" @click="openDatePicker">📅</span
      ><input
        ref="idate"
        type="text"
        :placeholder="TODAY"
        :class="{ date: true, invalid: isDateInvalid }"
        v-model="date"
        @change="onDateInput"
        maxlength="10"
      /><span class="icon time" @click="openTimePicker">🕑</span><input
      ref="itime"
      type="text"
        :placeholder="ZERO_TIME"
        :class="{ time: true, invalid: isTimeInvalid }"
        v-model="time"
        @change="onTimeInput"
        maxlength="5"
      />
    </div>
    <datetime
      type="date"
      v-model="selector.date"
      zone="UTC"
      input-class="datetime-hidden"
      ref="sdate"
      @input="onDatePick">
    </datetime>
    <datetime
      type="time"
      v-model="selector.time"
      zone="UTC"
      input-class="datetime-hidden"
      ref="stime"
      @input="onTimePick">
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
  data () {
    let date = ''
    let time = ''
    let selector = { date: null, time: null }
    if (this.value) {
      let dt = new Date(this.value).toISOString()
      selector = { date: dt, time: dt }
      date = dt.slice(0, 10)
      time = dt.slice(11, 16)
      if (time === ZERO_TIME) {
        time = ''
      } else if (date === new Date().toISOString().slice(0, 10)) {
        date = ''
      }
    }
    return {
      date,
      time,
      selector,
      TODAY,
      ZERO_TIME
    }
  },
  created () {
    //
  },
  computed: {
    isDateInvalid () {
      return this.date ? isNaN(this.testDate(this.date)) : false
    },
    isTimeInvalid () {
      return this.time ? isNaN(this.testTime(this.time)) : false
    }
  },
  methods: {
    onDatePick (date) {
      if (this.$el) {
        this.date = date.slice(0, 10)
        const timestamp = this.testDate(this.date, this.time)
        this.$emit('input', timestamp)
        const target = this.$refs.idate
        target.blur()
        target.focus()
        this.$el.dispatchEvent(new Event('change', { target, bubbles: true }))
      }
    },
    onTimePick (time) {
      if (this.$el) {
        this.time = time.slice(11, 16)
        const timestamp = this.testTime(this.time, this.date)
        this.$emit('input', timestamp)
        const target = this.$refs.itime
        target.blur()
        target.focus()
        this.$el.dispatchEvent(new Event('change', { target, bubbles: true }))
      }
    },
    onDateInput (e) {
      const timestamp = this.testDate(e.target.value, this.time)
      if (isNaN(timestamp)) {
        e.stopPropagation()
      }
      this.$emit('input', timestamp)
    },
    onTimeInput (e) {
      const timestamp = this.testTime(e.target.value, this.date)
      if (isNaN(timestamp)) {
        e.stopPropagation()
      }
      this.$emit('input', timestamp)
    },
    openDatePicker () {
      this.$refs.sdate.$el.firstElementChild.click()
    },
    openTimePicker () {
      this.$refs.stime.$el.firstElementChild.click()
    },
    testDate (value, time) {
      time = time || ZERO_TIME
      return +new Date(`${value}T${time}:00.000Z`)
    },
    testTime (value, date) {
      date = date || TODAY
      return +new Date(`${date}T${value}:00.000Z`)
    }
  }
}
</script>
<style scoped>
  div.container {
    position: relative;
    display: inline-block;
    background-color: white;
    outline: solid 1px #cccccc;
    white-space: nowrap;
    height: 30px;
    padding: 0;
    margin: 2px 0;
    width: 100%;
    /*width: 160px;*/
  }
  div.container > input {
    box-sizing: border-box;
    display: inline-block;
    border: none;
    margin: 0;
    padding: 0 0 0 30px;
    height: 100%;
  }
  div.container > input:focus {
    outline: none;
    border-bottom: solid 2px green;
  }
  input.invalid,
  input.invalid:focus {
    border-bottom: solid 2px red;
  }
  input.date {
    width: 60%;
  }
  input.time {
    width: 40%;
    border-left: dashed 1px #cccccc;
  }
  span.icon {
    position: absolute;
    display: inline-block;
    margin-top: 2px;
    margin-left: 5px;
    cursor: pointer;
  }
  span.icon.date {
    left: 0;
  }
  span.icon.time {
    left: 60%;
  }
</style>
<style>
  .datetime-hidden {
    display: none;
  }
</style>
