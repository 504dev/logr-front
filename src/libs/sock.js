import { v7 as uuidv7 } from 'uuid'

export default class Sock {
  constructor (url, jwt) {
    this.id = uuidv7() //Math.random().toString(36).substring(2, 15)
    this.url = url
    this.jwt = jwt
    this.socket = null
    this.handlers = {}
    this.retries = 0
  }
  connect (paused) {
    return new Promise((resolve, reject) => {
      let url = `${this.url}?token=${this.jwt}&sock_id=${this.id}`
      if (paused) {
        url += '&paused=true'
      }
      this.socket = new WebSocket(url)
      this.socket.onopen = resolve
      this.socket.onerror = reject
      this.socket.onmessage = this._handleMessage.bind(this)
      this.socket.onclose = e => {
        if (this.retries > 5) {
          console.error('Socket closed too many times.');
          return
        }
        this.retries++
        const delaySeconds = (this.retries - 1) + (Math.random() * this.retries)
        console.log('Socket is closed. Reconnect will be attempted in %s second.', Math.round(delaySeconds), e)

        setTimeout(() => this.connect(), delaySeconds * 1000)
      };
    })
  }
  _handleMessage (event) {
    const data = JSON.parse(event.data)
    const handlers = this.handlers[data.path] || []
    handlers.forEach(handler => handler(data))
  }
  _send (data) {
    return this.socket.send(JSON.stringify(data))
  }
  unsubscribe (path, handler) {
    const handlers = this.handlers[path] || []
    const index = handlers.indexOf(handler)
    if (index !== -1) {
      handlers.slice(index, 1)
      this._send({ action: 'unsubscribe', path })
      return true
    }
    return false
  }
  on (path, handler) {
    this.handlers[path] = this.handlers[path] || []
    this.handlers[path].push(handler)
    this._send({ action: 'subscribe', path })
    return this.unsubscribe.bind(this, path, handler)
  }
  pause (state) {
    return this._send({ action: 'pause', payload: state })
  }
  emit (path, payload) {
    return this._send({ action: 'emit', path, payload })
  }
}
