import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './icons'
import VModal from 'vue-js-modal'
import { Datetime } from 'vue-datetime'
import 'vue-datetime/dist/vue-datetime.css'
Vue.use(Datetime)
Vue.use(VModal)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
