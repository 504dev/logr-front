'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  VUE_APP_REST: '"http://localhost:7778"',
  VUE_APP_WS: '"ws://localhost:7778/ws"'
})
