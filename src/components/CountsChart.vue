<template>
  <div :id="id"/>
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
    const id = `container_${this.kind}_${Math.random()}`
    return { id }
  },
  mounted() {
    this.render()
  },
  methods: {
    render() {
      console.log('render(%s)', this.id, this.series)
      const { title, subtitle, kind } = this
      let yAxisMax = null
      if (kind === 'per') {
        yAxisMax = Math.max(100, ...this.series.map(({ data }) => data.map(v => v[1])).flat())
      }
      Highcharts.chart(this.id, {
        chart: {
          type: 'area',
          zoomType: 'x',
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
        plotOptions: {
          area: {
            animation: false,
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
          max: yAxisMax
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
