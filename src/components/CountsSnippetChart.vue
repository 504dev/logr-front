<template>
  <div :id="id" />
</template>

<script>
import Highcharts from 'highcharts/highstock'

export default {
  props: {
    series: Array,
    volumes: Array,
    title: String,
    subtitle: String
  },
  data() {
    const id = 'container_' + Math.random()
    return { id }
  },
  mounted() {
    this.render()
  },
  methods: {
    render() {
      const { title, subtitle } = this
      Highcharts.chart(this.id, {
        chart: {
          type: 'line',
          style: {
            fontFamily: 'Courier, monospace'
          }
        },
        credits: {
          enabled: false
        },
        title: {
          text: title
        },
        subtitle: {
          text: subtitle
        },
        legend: {
          enabled: false
        },
        xAxis: {
          type: 'datetime'
        },
        yAxis: {
          title: {
            text: ''
          },
          lineWidth: 2
        },
        tooltip: {
          split: true,
          shared: true,
          crosshairs: true,
          // pointFormat: `<span style="color:{point.color}">●</span> {series.name}: <b>{point.y:,.2f}</b><br/>`,
          pointFormat: `<b>{point.y:,.2f}</b><br/>`,
          xDateFormat: '%H:%M'
        },
        series: this.series
      })
    }
  }
}
</script>
