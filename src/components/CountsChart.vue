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
    subtitle: String,
    kind: String
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
      const { title, subtitle, kind } = this
      Highcharts.chart(this.id, {
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
        plotOptions: {
          area: {
            stacking: kind === 'inc' ? 'normal' : undefined,
            marker: {
              enabled: true,
              symbol: 'circle',
              radius: 2
            }
          }
        },
        xAxis: {
          type: 'datetime'
        },
        yAxis: {
          title: {
            text: ''
          },
          max: kind === 'per' ? 100 : undefined
        },
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
