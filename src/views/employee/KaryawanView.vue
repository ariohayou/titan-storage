<template>
  <v-container fluid>
    <v-app-bar app class="white">
      <v-card-title class="headline" style="text-align: center">
        <v-btn icon @click="goBack">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
        <img src="/logisly.png" alt="Logo" class="logo-small">
      </v-card-title>
      <v-spacer></v-spacer>
    </v-app-bar>
    <v-container>
      <v-row align="center">
        <v-col cols="12">
          <v-card-text>
              <v-row justify="center">
                <v-col cols="auto">
                  <v-img :src="karyawanData.foto" alt="Profile Picture" class="profile-picture"></v-img>
                </v-col>
              </v-row>
            </v-card-text>
          <v-card class="data-card">
            <v-card-title class="headline">Profil Karyawan</v-card-title>
            <v-card-text>
              <table>
                <tbody>
                  <tr>
                    <td>Nama:</td>
                    <td>{{ karyawanData.displayName }}</td>
                  </tr>
                  <tr>
                    <td>Email:</td>
                    <td>{{ karyawanData.email }}</td>
                  </tr>
                  <tr>
                    <td>Jenis Kelamin:</td>
                    <td>{{ karyawanData.jenisKelamin }}</td>
                  </tr>
                  <tr>
                    <td>Tanggal Lahir:</td>
                    <td>{{ karyawanData.tanggalLahir }}</td>
                  </tr>
                  <tr>
                    <td>No. Telp:</td>
                    <td>{{ karyawanData.noTelp }}</td>
                  </tr>
                  <tr>
                    <td>Jabatan:</td>
                    <td>{{ karyawanData.jabatan }}</td>
                  </tr>
                  <tr>
                    <td>Alamat:</td>
                    <td>{{ karyawanData.alamat }}</td>
                  </tr>
                </tbody>
              </table>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script>
import firebase from "firebase/app";
import "firebase/auth";
import { db } from "@/main";
import Swal from "sweetalert2";

export default {
  name: "KaryawanView",
  data() {
    return {
      karyawanData: null,
    };
  },
  created() {
    const user = firebase.auth().currentUser;
    if (user) {
      this.getKaryawanData(user.email);
    } else {
      console.error("User not logged in.");
      this.$router.push("/home");
    }
  },
  methods: {
    async getKaryawanData(email) {
      try {
        const querySnapshot = await db
          .collection("registrations")
          .where("email", "==", email)
          .get();

        if (!querySnapshot.empty) {
          const registrationData = querySnapshot.docs[0].data();

          this.karyawanData = {
            displayName: registrationData.displayName,
            email: registrationData.email,
            jenisKelamin: registrationData.jenisKelamin,
            tanggalLahir: registrationData.tanggalLahir,
            noTelp: registrationData.noTelp,
            jabatan: registrationData.jabatan,
            alamat: registrationData.alamat,
            foto: registrationData.foto,
          };
        } else {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Data pendaftaran karyawan tidak ditemukan",
          });
        }
      } catch (error) {
        console.error("Error getting karyawan data:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Terjadi kesalahan saat mengambil data karyawan",
        });
      }
    },
    goBack() {
      this.$router.push("/home");
    },
  },
};
</script>

<style scoped>
.logo-small {
  width: 50px;
  height: 50px;
  display: block;
  margin: 0 auto;
}

.profile-card,
.data-card {
  margin-bottom: 24px;
}

.profile-picture {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  margin: 0 auto;
}

table {
  width: 100%;
}

td {
  padding: 8px 0;
}

.headline {
  margin-bottom: 16px;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
}
</style>
