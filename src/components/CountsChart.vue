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
      Highcharts.stockChart(this.id, {
        chart: {
          type: 'area',
          zoomType: 'x'
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
          enabled: true
        },
        navigator: {
          enabled: false
        },
        scrollbar: {
          enabled: false
        },
        plotOptions: {
          area: {
            stacking: 'normal'
          },
          series: {
            animation: false
          }
        },
        rangeSelector: {
          inputEnabled: false,
          selected: 2,
          labelStyle: {
            display: 'none'
          }
        },
        xAxis: {
          type: 'datetime',
          events: {
            afterSetExtremes(e) {
              // console.log(title, e.min, e.max, e.trigger)
              // if (e.trigger) {
              //   Highcharts.charts.forEach((chart) => chart.xAxis[0].setExtremes(e.min, e.max))
              // }
            }
          }
        },
        yAxis: [
          {
            labels: {
              align: 'right',
              x: -3
            },
            title: {
              text: ''
            },
            height: '75%',
            lineWidth: 2,
            resize: {
              enabled: true
            }
          }
        ],
        tooltip: {
          split: true,
          shared: true,
          crosshairs: true,
          pointFormat: `<span style="color:{point.color}">●</span> {series.name}: <b>{point.y:,.2f}</b><br/>`
        },
        series: this.series
      })
    }
  }
}
</script>
