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
      Highcharts.stockChart(this.id, {
        chart: {
          type: 'area',
          zoomType: 'x'
        },
        credits: {
          enabled: false
        },
        title: {
          text: this.title
        },
        subtitle: {
          text: this.subtitle
        },
        legend: {
          enabled: true
        },
        navigator: {
          enabled: true
        },
        scrollbar: {
          enabled: true
        },
        plotOptions: {
          area: {
            stacking: 'normal'
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
          type: 'datetime'
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
