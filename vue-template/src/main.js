import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import demo from '@/lib/demo'
import toast from '@/lib/toast'
Vue.use(toast)
Vue.use(demo, {
  name: 'xm',
  age: 1
})

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
