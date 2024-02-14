import Vue from 'vue'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck'
import { faCopy } from '@fortawesome/free-solid-svg-icons/faCopy'
import { faCog } from '@fortawesome/free-solid-svg-icons/faCog'
import { faEnvelopeOpenText } from '@fortawesome/free-solid-svg-icons/faEnvelopeOpenText'
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons/faSignOutAlt'
import { faPlusSquare } from '@fortawesome/free-solid-svg-icons/faPlusSquare'
import { faMoon } from '@fortawesome/free-solid-svg-icons/faMoon'
import { faPause } from '@fortawesome/free-solid-svg-icons/faPause'
import { faWindowMaximize } from '@fortawesome/free-solid-svg-icons/faWindowMaximize'
import { faAngleDown } from '@fortawesome/free-solid-svg-icons/faAngleDown'
import { faChevronCircleDown } from '@fortawesome/free-solid-svg-icons/faChevronCircleDown'
import { faCompactDisc } from '@fortawesome/free-solid-svg-icons/faCompactDisc'
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons/faTimesCircle'
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes'
import { faEdit } from '@fortawesome/free-solid-svg-icons/faEdit'
import { faShare } from '@fortawesome/free-solid-svg-icons/faShare'
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons/faTrashAlt'
import { faKey } from '@fortawesome/free-solid-svg-icons/faKey'
import { faClock } from '@fortawesome/free-solid-svg-icons/faClock'
import { faCalendar } from '@fortawesome/free-solid-svg-icons/faCalendar'
import { faChartLine } from '@fortawesome/free-solid-svg-icons/faChartLine'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons/faExclamationTriangle'
import { faSortAmountUpAlt } from '@fortawesome/free-solid-svg-icons/faSortAmountUpAlt'
import { faSortAmountDown } from '@fortawesome/free-solid-svg-icons/faSortAmountDown'
import { faMoon as farMoon } from '@fortawesome/free-regular-svg-icons/faMoon'
import { faWindowMaximize as farWindowMaximize } from '@fortawesome/free-regular-svg-icons/faWindowMaximize'
import { faGithub as fabGithub } from '@fortawesome/free-brands-svg-icons/faGithub'

library.add(faCopy)
library.add(faCheck)
library.add(faCog)
library.add(faEnvelopeOpenText)
library.add(faSignOutAlt)
library.add(faPlusSquare)
library.add(faMoon)
library.add(faPause)
library.add(faWindowMaximize)
library.add(faAngleDown)
library.add(faChevronCircleDown)
library.add(faCompactDisc)
library.add(faTimesCircle)
library.add(faTimes)
library.add(faEdit)
library.add(faShare)
library.add(faTrashAlt)
library.add(faKey)
library.add(faClock)
library.add(faCalendar)
library.add(faChartLine)
library.add(faExclamationTriangle)
library.add(faSortAmountUpAlt)
library.add(faSortAmountDown)

library.add(farMoon)
library.add(farWindowMaximize)

library.add(fabGithub)

Vue.component('font-awesome-icon', FontAwesomeIcon)
