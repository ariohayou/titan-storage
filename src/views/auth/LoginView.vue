<template>
  <div>
    <v-form name="login-form">
      <v-container>
        <v-row align="center" justify="center">
          <v-col lg="6" md="6" sm="6">
            <v-card>
              <v-card-title class="headline">
                <img src="/logisly.png" alt="Logo" class="logo-small">
              </v-card-title>
              <v-card-subtitle class="title text-center">Login</v-card-subtitle>
              <v-card-text>
                <v-text-field v-model="input.username" label="E-mail" outlined></v-text-field>
                <v-text-field v-model="input.password" label="Password" type="password" outlined></v-text-field>
                <v-row justify="center">
                  <v-btn class="mx-2 button-login" color="green" dark @click.prevent="login">Login</v-btn>
                </v-row>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </div>
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
    };
  },
  methods: {
    ...mapMutations(['setUserRole']),
    login() {
      // Pastikan username DAN password tidak kosong
      if (this.input.username !== '' && this.input.password !== '') {
        console.log('authenticated');
        firebase
          .auth()
          .signInWithEmailAndPassword(this.input.username, this.input.password)
          .then((data) => {
            console.log('Successfully logged in!', data);
            this.showHomePage(); // Menampilkan halaman Home
            this.setRole(); // Set peran pengguna setelah login berhasil
          })
          .catch((error) => {
            console.log(error.code);
            // Tampilkan pesan error menggunakan SweetAlert2
            swal.fire({
              title: 'Login Error',
              text: 'Invalid email or password',
              icon: 'error',
              confirmButtonText: 'OK',
            });
          });
      } else {
        console.log('Username and Password cannot be empty');
      }
    },
    showHomePage() {
      // Menggunakan SweetAlert2 untuk menampilkan pesan sukses
      swal
        .fire({
          title: 'Login Success',
          icon: 'success',
          timer: 10000,
          showConfirmButton: false,
        })
        .then(() => {
          // Routing ke halaman HomeView.vue
          this.$router.push('/home');
        });
    },
    setRole() {
      console.log("masuk setRole")
      const user = firebase.auth().currentUser;
      if (user) {
        console.log(user.email)
        db.collection("registrations")
          .where("email", "==", user.email)
          .get()
          .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
              // Access the document data
              const data = doc.data();
              console.log(data);
              localStorage.setItem("role", data.jabatan)
            });
          })
          .catch((error) => {
            console.error("Error getting registrations:", error);
          });
      }
    },
  },
};
</script>

<style>
.logo-small {
  width: 100px;
  height: 100px;
  display: block;
  margin: 0 auto;
}

.register-link {
  color: blue;
  text-decoration: underline;
  text-align: center;
  display: block;
  margin-top: 40px;
}

.button-login {
  margin-top: 20px;
}
</style>
