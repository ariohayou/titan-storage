import Vue from 'vue';
import App from './App.vue';
import VueMeta from 'vue-meta';
import vuetify from './plugins/vuetify';
import router from "./router";
import mixin from "./mixin";
import store from "./store";
import ToastPlugin from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';
import firebase from "firebase/app"; // Pastikan menggunakan "firebase/app" di versi 8
import "firebase/firestore";
import "firebase/storage";

// import vueNiceScrollbar from 'vue-nice-scrollbar';
Vue.use(ToastPlugin);
Vue.use(VueMeta);

// Vue.use(vueNiceScrollbar);

Vue.config.productionTip = false;

// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAENnZPoFFBiRI5ca0YMATYnkH9PpAaBTA",
  authDomain: "titans-project-7a756.firebaseapp.com",
  projectId: "titans-project-7a756",
  storageBucket: "titans-project-7a756.appspot.com",
  messagingSenderId: "856688107931",
  appId: "1:856688107931:web:43d98e78ce23c89bb4013e"
};

// Inisialisasi Firebase
firebase.initializeApp(firebaseConfig);

// Inisialisasi Firestore
const db = firebase.firestore();
export { db };

// Inisialisasi Storage
const storage = firebase.storage();
export { storage };

// Mixin
Vue.mixin(mixin);

new Vue({
  router,
  vuetify,
  store,
  render: (h) => h(App),
}).$mount('#app');
