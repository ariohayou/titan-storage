<template>
  <v-container fluid class="mb-5">
    <v-app-bar app class="white">
      <v-card-title class="headline">
        <v-btn icon @click="goBack">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        Account List
      </v-card-title>
      <v-spacer></v-spacer>
      
    </v-app-bar>

    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-row>
              <v-col cols="6" sm="6" md="4">
                <v-text-field v-model="search" label="Search" append-icon="mdi-magnify" outlined hide-details></v-text-field>
              </v-col>
              <v-col cols="6" sm="6" md="4">
              <v-btn color="primary" @click="navigateToRegister">Add New Account</v-btn>
            </v-col>  
            </v-row>
          </v-card-title>
          <v-card-text>
            <v-data-table :headers="headers" :items="filteredKaryawanData" item-key="id" hide-default-footer class="elevation-1">
              <template v-slot:top>
                <v-toolbar flat>
                  <v-toolbar-title>Karyawan</v-toolbar-title>
                  <v-spacer></v-spacer>
                  <v-btn color="primary" @click="exportToExcel">Export Excel</v-btn>
                </v-toolbar>
              </template>
              <template v-slot:[`item.actions`]="{ item }">
                <v-icon class="mr-2" @click="editKaryawan(item)">mdi-pencil</v-icon>
                <v-icon @click="deleteKaryawan(item)">mdi-delete</v-icon>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog Edit Karyawan -->
    <v-dialog v-model="dialogEdit" max-width="600px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ editedKaryawan.displayName }}</span>
        </v-card-title>
        <v-card-text>
          <v-container>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field v-model="editedKaryawan.displayName" label="Display Name"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="editedKaryawan.email" label="Email" disabled></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field v-model="editedKaryawan.noTelp" label="No. Telp"></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="editedKaryawan.tanggalLahir" label="Tanggal Lahir"></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="6">
                <v-select v-model="editedKaryawan.jenisKelamin" label="Jenis Kelamin" :items="jenisKelaminOptions"></v-select>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field v-model="editedKaryawan.alamat" label="Alamat"></v-text-field>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12" sm="6">
                <v-select v-model="editedKaryawan.jenisSIM" label="Jenis SIM" :items="jenisSIMOptions"></v-select>
              </v-col>
            </v-row>
          </v-container>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" text @click="cancelEdit">Batal</v-btn>
          <v-btn color="primary" @click="saveEdit">Simpan</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import firebase from "firebase/app";
import "firebase/firestore";
import Swal from "sweetalert2";
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

export default {
  name: "ListKaryawanView",
  data() {
    return {
      search: "",
      karyawanList: [],
      headers: [
        { text: "Display Name", value: "displayName" },
        { text: "Email", value: "email" },
        { text: "No. Telp", value: "noTelp" },
        { text: "Tanggal Lahir", value: "tanggalLahir" },
        { text: "Jenis Kelamin", value: "jenisKelamin" },
        { text: "Alamat", value: "alamat" },
        { text: "Jenis SIM", value: "jenisSIM" },
        { text: "Actions", value: "actions", sortable: false }
      ],
      dialogEdit: false,
      editedKaryawan: {
        id: "",
        displayName: "",
        email: "",
        noTelp: "",
        tanggalLahir: "",
        jenisKelamin: "",
        alamat: "",
        jenisSIM: ""
      },
      jenisKelaminOptions: ["Laki-laki", "Perempuan"],
      jenisSIMOptions: ["SIM A", "SIM B", "SIM C"]
    };
  },
  created() {
    this.getKaryawanList();
  },
  methods: {
    getKaryawanList() {
      const db = firebase.firestore();
      db.collection("registrations")
        .get()
        .then(querySnapshot => {
          const karyawanList = [];
          querySnapshot.forEach(doc => {
            const karyawan = doc.data();
            karyawan.id = doc.id;
            karyawanList.push(karyawan);
          });
          this.karyawanList = karyawanList;
        })
        .catch(error => {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Terjadi kesalahan saat mengambil data karyawan"
          });
          console.error("Error getting karyawan list:", error);
        });
    },
    editKaryawan(karyawan) {
      this.editedKaryawan = { ...karyawan };
      this.dialogEdit = true;
    },
    cancelEdit() {
      this.dialogEdit = false;
      this.editedKaryawan = {
        id: "",
        displayName: "",
        email: "",
        noTelp: "",
        tanggalLahir: "",
        jenisKelamin: "",
        alamat: "",
        jenisSIM: ""
      };
    },
    saveEdit() {
      const db = firebase.firestore();
      db.collection("registrations")
        .doc(this.editedKaryawan.id)
        .update(this.editedKaryawan)
        .then(() => {
          Swal.fire({
            icon: "success",
            title: "Sukses",
            text: "Karyawan berhasil diperbarui"
          });
          this.dialogEdit = false;
          this.getKaryawanList();
        })
        .catch(error => {
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Terjadi kesalahan saat memperbarui karyawan"
          });
          console.error("Error updating karyawan:", error);
        });
    },
    deleteKaryawan(karyawan) {
      Swal.fire({
        title: "Konfirmasi",
        text: "Anda yakin ingin menghapus karyawan ini?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ya, hapus",
        cancelButtonText: "Batal"
      }).then(result => {
        if (result.isConfirmed) {
          const db = firebase.firestore();
          db.collection("registrations")
            .doc(karyawan.id)
            .delete()
            .then(() => {
              Swal.fire({
                icon: "success",
                title: "Sukses",
                text: "Karyawan berhasil dihapus"
              });
              this.getKaryawanList();
            })
            .catch(error => {
              Swal.fire({
                icon: "error",
                title: "Error",
                text: "Terjadi kesalahan saat menghapus karyawan"
              });
              console.error("Error deleting karyawan:", error);
            });
        }
      });
    },
    exportToExcel() {
      const data = this.filteredKaryawanData.map(karyawan => ({
        'Display Name': karyawan.displayName,
        'Email': karyawan.email,
        'No. Telp': karyawan.noTelp,
        'Tanggal Lahir': karyawan.tanggalLahir,
        'Jenis Kelamin': karyawan.jenisKelamin,
        'Alamat': karyawan.alamat,
        'Jenis SIM': karyawan.jenisSIM
      }));

      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Karyawan');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array', compression: true });
      const dataBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const filename = 'karyawan_data.xlsx';

      saveAs(dataBlob, filename);
    },
    goBack() {
      this.$router.go(-1);
    },
    navigateToRegister() {
      this.$router.push('/register');
    }
  },
  computed: {
    filteredKaryawanData() {
      if (!this.search) {
        return this.karyawanList;
      } else {
        const keyword = this.search.toLowerCase();
        return this.karyawanList.filter(karyawan =>
          karyawan.displayName.toLowerCase().includes(keyword) ||
          karyawan.email.toLowerCase().includes(keyword) ||
          karyawan.noTelp.toLowerCase().includes(keyword) ||
          karyawan.tanggalLahir.toLowerCase().includes(keyword) ||
          karyawan.jenisKelamin.toLowerCase().includes(keyword) ||
          karyawan.alamat.toLowerCase().includes(keyword) ||
          karyawan.jenisSIM.toLowerCase().includes(keyword)
        );
      }
    }
  }
};
</script>

<style scoped>
.v-data-table tbody tr td {
  white-space: nowrap;
}

.clickable {
  cursor: pointer;
}

.v-data-table thead th {
  white-space: nowrap;
}

.logo-small {
  width: 50px;
  height: 50px;
  display: block;
  margin: 0 auto;
}
</style>
