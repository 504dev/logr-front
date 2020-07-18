import Vue from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
library.add(fas.faSignOutAlt)
library.add(fas.faPlusSquare)
library.add(fas.faMoon)
library.add(fas.faPause)
library.add(fas.faWindowMaximize)
library.add(fas.faAngleDown)
library.add(fas.faChevronCircleDown)
library.add(fas.faCompactDisc)
library.add(fas.faTimesCircle)
library.add(fas.faEdit)
library.add(fas.faShare)
library.add(fas.faTrashAlt)
library.add(fas.faKey)
library.add(fas.faClock)
library.add(fas.faCalendar)
library.add(fas.faChartLine)
library.add(fas.faExclamationTriangle)
library.add(fas.faSortAmountUpAlt)
library.add(fas.faSortAmountDown)
library.add(far.faMoon)
library.add(far.faWindowMaximize)
Vue.component('font-awesome-icon', FontAwesomeIcon)
