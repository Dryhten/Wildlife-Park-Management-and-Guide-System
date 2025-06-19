// store/index.js
import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: null, // 用户信息
    isAuthenticated: false // 登录状态
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user;
      state.isAuthenticated = !!user;
    }
  },
  actions: {
    // 设置用户信息
    setUser({ commit }, user) {
      commit('SET_USER', user);
    },
    // 从 localStorage 加载用户信息
    loadUserFromStorage({ commit }) {
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const token = localStorage.getItem('token');

      if (user && token) {
        commit('SET_USER', user);
      }
    }
  }
});