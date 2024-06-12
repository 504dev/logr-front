import { createApp } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { createVfm } from 'vue-final-modal'
import { router } from '@/router'
import { store } from '@/store'
import App from '@/App.vue'
import '@/icons'
import 'vue-final-modal/style.css'

const app = createApp(App)

app.component('FontAwesomeIcon', FontAwesomeIcon)
app.use(router)
app.use(store)
app.use(createVfm())

app.mount('#app')
