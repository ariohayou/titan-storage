// index.js (di direktori store Vuex)

import Vue from "vue";
import Vuex from "vuex";
import AuthModule from "./modules/AuthModule";
import FilterModule from "./modules/FilterModule";

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    auth: {
      namespaced: true,
      ...AuthModule,
      state: {
        userRole: "",
      },
      mutations: {
        setUserRole(state, role) {
          state.userRole = role;
        },
      },
      getters: {
        getUserRole: (state) => state.userRole,
      },
    },
    filter: FilterModule,
  },
});

export default store;
