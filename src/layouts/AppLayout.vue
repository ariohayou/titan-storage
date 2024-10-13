<template>
  <v-app id="app">
    <v-main>
      <router-view></router-view>
    </v-main>
  </v-app>
</template>

<script>
import {mapGetters} from "vuex";

export default {
  name: "AppLayout",
  data() {
    return {
      drawer: null,
    };
  },

  computed: {
    ...mapGetters({
      identity: 'auth/identity',
      titleHierarchy: 'auth/titleHierarchy'
    }),
  },

  async mounted() {
  },

  methods: {},
};
</script>
