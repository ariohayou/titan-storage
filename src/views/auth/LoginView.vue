<template>
  <v-container fluid class="login-container">
    <v-row align="center" justify="center" class="fill-height">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12 login-card">
          <v-card-title class="text-center">
            <img src="/Titan.png" alt="Logo" class="logo-large" />
          </v-card-title>
          <v-card-subtitle class="text-center subtitle-1 mb-4">TITAN STORAGE</v-card-subtitle>
          <v-card-text>
            <v-form ref="form" v-model="valid" lazy-validation>
              <v-text-field
                v-model="input.username"
                label="Email"
                outlined
                :rules="[v => !!v || 'Email is required']"
                prepend-icon="mdi-email"
                type="email"
              ></v-text-field>
              <v-text-field
                v-model="input.password"
                label="Password"
                outlined
                :rules="[v => !!v || 'Password is required']"
                prepend-icon="mdi-lock"
                type="password"
              ></v-text-field>
              <v-row justify="center" class="mt-3">
                <v-btn
                  :loading="loading"
                  color="primary"
                  dark
                  block
                  class="button-login"
                  @click.prevent="login"
                >
                  <v-icon left>mdi-login</v-icon>
                  Login
                </v-btn>
              </v-row>
              <v-row justify="center" class="mt-2">
              </v-row>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import firebase from 'firebase';
import swal from 'sweetalert2';
import { db } from '@/main';
import { mapMutations } from 'vuex';

export default {
  name: 'LoginView',
  data() {
    return {
      input: {
        username: '',
        password: '',
      },
      loading: false,
      valid: true,
    };
  },
  methods: {
    ...mapMutations(['setUserRole']),
    login() {
      if (this.$refs.form.validate()) {
        this.loading = true;
        firebase
          .auth()
          .signInWithEmailAndPassword(this.input.username, this.input.password)
          .then((data) => {
            this.loading = false;
            this.showHomePage(); 
            this.setRole(); 
          })
          .catch((error) => {
            this.loading = false;
            swal.fire({
              title: 'Login Error',
              text: 'Invalid email or password',
              icon: 'error',
              confirmButtonText: 'OK',
            });
          });
      } else {
        swal.fire({
          title: 'Error',
          text: 'Please fill in all required fields',
          icon: 'warning',
          confirmButtonText: 'OK',
        });
      }
    },
    showHomePage() {
      swal
        .fire({
          title: 'Login Success',
          icon: 'success',
          timer: 1000,
          showConfirmButton: false,
        })
        .then(() => {
          this.$router.push('/home');
        });
    },
    setRole() {
      const user = firebase.auth().currentUser;
      if (user) {
        db.collection("registrations")
          .where("email", "==", user.email)
          .get()
          .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              const data = doc.data();
              localStorage.setItem("role", data.jabatan)
            });
          })
          .catch((error) => {
            console.error("Error getting registrations:", error);
          });
      }
    },
    navigateToRegister() {
      this.$router.push('/register');
    }
  },
};
</script>

<style scoped>
.login-container {
  background-color: #f5f5f5;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-card {
  padding: 20px;
  border-radius: 10px;
  background-color: #ffffff;
}

.logo-large {
  width: 80px;
  height: 80px;
  display: block;
  margin: 0 auto;
}

.subtitle-1 {
  font-size: 20px;
  color: #4a4a4a;
}

.button-login {
  width: 100%;
}

.v-btn--text .v-btn__content {
  color: #1976d2 !important;
}
</style>
