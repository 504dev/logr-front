'use strict'
module.exports = {
  NODE_ENV: '"production"',
  VUE_APP_REST: `"${process.env.VUE_APP_REST || ''}"`,
  VUE_APP_WS: `"${process.env.VUE_APP_WS || ''}"`
}
