<template>
  <div>
    <div class="container">
      <span class="icon date" @click="openDatePicker"><i class="fa fa-calendar"></i></span
      ><input
        ref="idate"
        type="text"
        :placeholder="TODAY"
        :class="{ date: true, invalid: isDateInvalid }"
        v-model="date"
        @change="onDateInput"
        maxlength="10"
      /><span class="icon time" @click="openTimePicker"><i class="fa fa-clock"></i></span
      ><input
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
      @input="onDatePick"
    >
    </datetime>
    <datetime
      type="time"
      v-model="selector.time"
      zone="UTC"
      input-class="datetime-hidden"
      ref="stime"
      @input="onTimePick"
    >
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
  created() {
    //
  },
  computed: {
    isDateInvalid() {
      return this.date ? isNaN(this.test(this.date, ZERO_TIME)) : false
    },
    isTimeInvalid() {
      return this.time ? isNaN(this.test(TODAY, this.time)) : false
    }
  },
  methods: {
    onDatePick(date) {
      if (this.$el) {
        this.date = date.slice(0, 10)
        const timestamp = this.test(this.date, this.time)
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
        this.time = time.slice(11, 16)
        const timestamp = this.test(this.date, this.time)
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
      const timestamp = this.test(e.target.value, this.time)
      if (isNaN(timestamp)) {
        e.stopPropagation()
        return
      }
      this.$emit('input', timestamp)
    },
    onTimeInput(e) {
      const timestamp = this.test(this.date, e.target.value)
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
  background-color: white;
  border: solid 1px #999;
  border-bottom-width: 2px;
  white-space: nowrap;
  height: 30px;
  padding: 0;
  margin: 2px 0;
  width: 100%;
  border-radius: 4px;
  overflow: hidden;

  > input {
    box-sizing: border-box;
    display: inline-block;
    border: none;
    margin: 0;
    padding: 0 0 0 10px;
    height: 100%;
    &.date {
      width: 60%;
    }
    &.time {
      width: 40%;
      border-left: dashed 1px #999;
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
</style>
<style>
.datetime-hidden {
  display: none;
}
</style>
