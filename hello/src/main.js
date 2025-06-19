import Vue from 'vue';
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import App from './App.vue';
import store from './store';
import router from '@/router/index.js';
import axios from 'axios';
import { init } from "echarts";

Vue.prototype.$echarts = init;
Vue.config.productionTip = false;
Vue.prototype.$axios = axios; 
// 初始化 Vuex 状态
store.dispatch('loadUserFromStorage');
Vue.use(ElementUI);

new Vue({
  store,
  el: '#app',
  render: h => h(App),
  router
});