'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  VUE_APP_REST: '"http://api.logr.loc:7778"',
  VUE_APP_WS: '"ws://api.logr.loc:7778/ws"'
})
