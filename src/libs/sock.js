const _ = require('lodash')

export default class Sock {
  constructor (url, jwt) {
    this.id = Math.random().toString(36).substring(2, 15)
    this.url = url
    this.jwt = jwt
    this.socket = null
    this.handlers = {}
  }
  connect () {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(`${this.url}?token=${this.jwt}&sock_id=${this.id}`)
      this.socket.onopen = resolve
      this.socket.onerror = reject
      this.socket.onmessage = this._handleMessage.bind(this)
    })
  }
  _handleMessage (event) {
    const data = JSON.parse(event.data)
    _.each(this.handlers[data.path], handler => handler(data))
  }
  on (path, handler) {
    this.handlers[path] = this.handlers[path] || []
    this.handlers[path].push(handler)
  }
  emit (path, payload) {
    const data = { action: 'emit', path, payload }
    this.socket.send(JSON.stringify(data))
  }
}
