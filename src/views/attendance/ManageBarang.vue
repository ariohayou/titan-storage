<template>
    <v-container fluid>
      <v-row justify="center">
        <v-col cols="12" sm="10" md="8">
          <v-card>
            <v-card-title>
              <span class="headline">Manajemen Barang</span>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="dialog = true">Tambah Barang</v-btn>
            </v-card-title>
            <v-card-text>
              <v-data-table :headers="headers" :items="barangs" item-key="id" class="elevation-1">
                <template v-slot:[`item.actions`]="{ item }">
                  <v-icon small @click="editBarang(item)">mdi-pencil</v-icon>
                  <v-icon small @click="deleteBarang(item.id)" color="red">mdi-delete</v-icon>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
  
          <v-dialog v-model="dialog" max-width="500px">
            <v-card>
              <v-card-title>
                <span class="headline">{{ editMode ? 'Edit' : 'Tambah' }} Barang</span>
              </v-card-title>
              <v-card-text>
                <v-form ref="form" v-model="valid">
                  <v-text-field v-model="input.nama" label="Nama Barang" outlined :rules="[v => !!v || 'Nama barang harus diisi']"></v-text-field>
                  <v-text-field v-model="input.kategori" label="Kategori" outlined :rules="[v => !!v || 'Kategori harus diisi']"></v-text-field>
                  <v-text-field v-model="input.harga" label="Harga" outlined type="number" :rules="[v => !!v || 'Harga harus diisi']"></v-text-field>
                  <v-text-field v-model="input.stok" label="Stok" outlined type="number" :rules="[v => !!v || 'Stok harus diisi']"></v-text-field>
                  <v-text-field v-model="input.satuan" label="Satuan" outlined :rules="[v => !!v || 'Satuan harus diisi']"></v-text-field>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="red" @click="dialog = false">Batal</v-btn>
                <v-btn color="green darken-1" @click="saveBarang">{{ editMode ? 'Simpan' : 'Tambah' }}</v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  import firebase from 'firebase/app';
  import 'firebase/firestore';
  
  export default {
    data() {
      return {
        dialog: false,
        valid: false,
        editMode: false,
        input: {
          id: null,
          nama: '',
          kategori: '',
          harga: 0,
          stok: 0,
          satuan: ''
        },
        headers: [
          { text: 'Nama Barang', value: 'nama' },
          { text: 'Kategori', value: 'kategori' },
          { text: 'Harga', value: 'harga' },
          { text: 'Stok', value: 'stok' },
          { text: 'Satuan', value: 'satuan' },
          { text: 'Aksi', value: 'actions', sortable: false }
        ],
        barangs: [],
      };
    },
    created() {
      this.fetchBarangs();
    },
    methods: {
      async fetchBarangs() {
        const snapshot = await firebase.firestore().collection('barangs').get();
        this.barangs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      },
      async saveBarang() {
  if (this.$refs.form.validate()) {
    try {
      if (this.editMode) {
        // Update barang yang sudah ada
        await firebase.firestore().collection('barangs').doc(this.input.id).update({
          nama: this.input.nama,
          kategori: this.input.kategori,
          harga: this.input.harga,
          stok: this.input.stok,
          satuan: this.input.satuan
        });
      } else {
        // Tambah barang baru
        const docRef = await firebase.firestore().collection('barangs').add({
          id: '',
          nama: this.input.nama,
          kategori: this.input.kategori,
          harga: this.input.harga,
          stok: this.input.stok,
          satuan: this.input.satuan
        });
        await docRef.update({ id: docRef.id });
        // Simpan ID dokumen yang baru dibuat
        this.input.id = docRef.id;
      }
      this.dialog = false;
      this.fetchBarangs();
      this.resetForm();
    } catch (error) {
      console.error('Error saving document:', error);
    }
  }
},
      editBarang(item) {
        this.editMode = true;
        this.input = { ...item };
        this.dialog = true;
      },
      async deleteBarang(id) {
        if (confirm('Apakah Anda yakin ingin menghapus barang ini?')) {
          try {
            await firebase.firestore().collection('barangs').doc(id).delete();
            this.fetchBarangs();
          } catch (error) {
            console.error('Error deleting document:', error);
          }
        }
      },
      resetForm() {
        this.input = {
          id: null,
          nama: '',
          kategori: '',
          harga: 0,
          stok: 0,
          satuan: ''
        };
        this.editMode = false;
      }
    }
  };
  </script>
  
  <style scoped>
  .register-card {
    margin-top: 32px;
  }
  </style>
  