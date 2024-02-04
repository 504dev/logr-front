<template>
  <div :id="id" />
</template>

<script>
import Highcharts from 'highcharts/highstock'
import { mapGetters } from 'vuex'

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
  computed: {
    ...mapGetters(['nFormatter'])
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
          lineWidth: 2,
          labels: {
            formatter: ({ value }) => {
              return this.nFormatter(value, 3)
            }
          }
        },
        plotOptions: {
          line: {
            animation: false
          }
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
