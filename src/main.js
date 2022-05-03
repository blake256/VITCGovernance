import '@/plugins/vue-composition-api'
import '@/styles/styles.scss'
import Vue from 'vue'
import VueApexCharts from 'vue-apexcharts'
import VueFormulate from '@braid/vue-formulate'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router/router'
import store from './store/store'

Vue.config.productionTip = false

// Apex charts
Vue.use(VueApexCharts)

// VueFormulate forms plugin
Vue.use(VueFormulate)

new Vue({
  router,
  store,
  vuetify,
  beforeCreate: () => {
    store.commit('initializeStore')
  },
  render: h => h(App),
}).$mount('#app')
