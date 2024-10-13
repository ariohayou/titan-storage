<template>
  <v-container fluid>
    <v-app-bar app class="white">
      <v-card-title class="headline">
        <v-btn icon @click="goBack">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <img src="/logisly.png" alt="Logo" class="logo-small">
      </v-card-title>
      <v-spacer></v-spacer>
    </v-app-bar>
    <v-row justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="register-card">
          <v-card-title class="headline">Register</v-card-title>
          <v-card-text>
            <v-form @submit.prevent="register">
              <v-container>
                <v-row>
                  <v-col cols="12">
                    <v-text-field v-model="input.email" label="E-mail" outlined required></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-text-field v-model="input.password" label="Password" type="password" outlined required></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-text-field v-model="input.displayName" label="Nama" outlined required></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-select v-model="input.jenisKelamin" label="Jenis Kelamin"
                      :items="['-- Pilih Jenis Kelamin --', 'Laki-Laki', 'Perempuan']" :rules="jenisKelaminRules"
                      outlined required></v-select>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-text-field v-model="input.tanggalLahir" label="Tanggal Lahir" type="date" outlined required></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-text-field v-model="input.noTelp" label="No. Telp" outlined required></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-select v-model="input.jabatan" label="Jabatan" :items="['-- Pilih Jabatan --', 'Admin', 'Staff']"
                      :rules="jabatanRules" outlined required></v-select>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-text-field v-model="input.alamat" label="Alamat" outlined required></v-text-field>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col cols="12">
                    <v-file-input v-model="input.fotoFile" label="Foto" outlined accept="image/*" @change="onFileChange"></v-file-input>
                  </v-col>
                </v-row>
                <v-row class="text-center">
                  <v-col cols="12">
                    <v-btn class="mx-2" color="red" dark @click="cancel">Cancel</v-btn>
                    <v-btn class="mx-2" color="primary" type="submit">Register</v-btn>
                  </v-col>
                </v-row>
              </v-container>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import firebase from "firebase/app";
import "firebase/auth";
import { db, storage } from "@/main";
import Swal from "sweetalert2";
import { mapMutations } from 'vuex';

export default {
  name: "RegisterView",
  data() {
    return {
      input: {
        email: "",
        password: "",
        displayName: "",
        jenisKelamin: "",
        tanggalLahir: "",
        noTelp: "",
        jabatan: "",
        alamat: "",
        fotoFile: null,  // Objek file yang diunggah
        fotoURL: "",     // URL foto setelah diunggah ke Firebase Storage
      },
      jenisKelaminRules: [
        (v) => !!v || "Jenis kelamin harus dipilih",
        (v) => v !== "-- Pilih Jenis Kelamin --" || "Jenis kelamin harus dipilih",
      ],
      jabatanRules: [
        (v) => !!v || "Jabatan harus dipilih",
        (v) => v !== "-- Pilih Jabatan --" || "Jabatan harus dipilih",
      ],
    };
  },
  methods: {
    ...mapMutations(['setUserRole']),
    
    onFileChange(file) {
      this.input.fotoFile = file;  // Simpan objek file ketika dipilih
    },

    async uploadFoto() {
      try {
        if (!this.input.fotoFile) {
          throw new Error("No file selected");
        }

        const email = this.input.email;
        const fileName = `${email}_${this.input.fotoFile.name}`;
        const storageRef = storage.ref().child(fileName);
        const snapshot = await storageRef.put(this.input.fotoFile);
        const downloadURL = await snapshot.ref.getDownloadURL();

        this.input.fotoURL = downloadURL; // Simpan URL ke input.fotoURL setelah diunggah
      } catch (error) {
        console.error("Error uploading photo:", error);
        Swal.fire("Gagal mengupload foto. Silakan coba lagi.");
        throw error;
      }
    },

    goBack() {
      this.$router.go(-1);
    },
    
    async register() {
      if (
        this.input.email &&
        this.input.password &&
        this.input.displayName &&
        this.input.jenisKelamin &&
        this.input.tanggalLahir &&
        this.input.noTelp &&
        this.input.jabatan &&
        this.input.alamat &&
        this.input.fotoFile // Pastikan file dipilih
      ) {
        try {
          const { user } = await firebase
            .auth()
            .createUserWithEmailAndPassword(this.input.email, this.input.password);

          // Upload foto ke Firebase Storage dan dapatkan URL-nya
          await this.uploadFoto();

          const registrationData = {
            email: this.input.email,
            displayName: this.input.displayName,
            jenisKelamin: this.input.jenisKelamin,
            tanggalLahir: this.input.tanggalLahir,
            noTelp: this.input.noTelp,
            jabatan: this.input.jabatan,
            alamat: this.input.alamat,
            foto: this.input.fotoURL, // Simpan URL foto, bukan objek File
          };

          await db.collection("registrations").add(registrationData);

          await user.updateProfile({
            displayName: this.input.displayName.replace(/\s/g, "_"),
            photoURL: this.input.fotoURL,
          });

          await this.setRoleBasedOnJabatan(this.input.jabatan);

          this.resetForm();

          Swal.fire({
            icon: "success",
            title: "Registration successful. Please login.",
            showConfirmButton: false,
            timer: 2000,
          });

          this.$router.push("/login");
        } catch (error) {
          console.error("Registration error:", error.code, error.message);
          Swal.fire("Registration failed. Please try again.");
        }
      } else {
        Swal.fire("Please fill in all fields.");
      }
    },

    async setRoleBasedOnJabatan(jabatan) {
      try {
        const email = this.input.email;

        if (jabatan === "Admin") {
          await db.collection("roles").doc(email).set({ role: "admin" });
          this.setUserRole('admin');
        } else if (jabatan === "Staff") {
          await db.collection("roles").doc(email).set({ role: "staff" });
          this.setUserRole('staff');
        }
      } catch (error) {
        console.error("Error setting role:", error);
        Swal.fire("Error setting role. Please try again.");
      }
    },

    resetForm() {
      this.input = {
        email: "",
        password: "",
        displayName: "",
        jenisKelamin: "",
        tanggalLahir: "",
        noTelp: "",
        jabatan: "",
        alamat: "",
        fotoFile: null,
        fotoURL: "",
      };
    },

    cancel() {
      this.resetForm();
      this.$router.push("/dashboard");
    },
  },
};
</script>
<style scoped>
.register-card {
  margin-top: 32px;
  padding: 16px;
}

.register-btn {
  margin: 8px;
}

.logo-small {
  width: 50px;
  height: 50px;
  display: block;
  margin: 0 auto;
}
</style>
