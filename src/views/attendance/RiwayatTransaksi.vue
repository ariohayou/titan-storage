<template>
    <v-container fluid>
      <v-row justify="center">
        <v-col cols="12" sm="10" md="8">
          <v-card>
            <v-card-title>
              <span class="headline">Riwayat Transaksi Stok</span>
            </v-card-title>
            <v-card-text>
              <v-data-table :headers="headers" :items="transaksi" item-key="id" class="elevation-1">
                <template v-slot:[`item.actions`]="{ item }">
                  <v-icon small @click="lihatDetail(item)">mdi-eye</v-icon>
                </template>
              </v-data-table>
            </v-card-text>
          </v-card>
  
          <v-dialog v-model="dialog" max-width="500px">
            <v-card>
              <v-card-title>
                <span class="headline">Detail Transaksi</span>
              </v-card-title>
              <v-card-text>
                <v-list dense>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>Barang</v-list-item-title>
                      <v-list-item-subtitle>{{ selectedTransaksi.barang }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>Jenis Transaksi</v-list-item-title>
                      <v-list-item-subtitle>{{ selectedTransaksi.jenis }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>Jumlah</v-list-item-title>
                      <v-list-item-subtitle>{{ selectedTransaksi.jumlah }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  <v-list-item>
                    <v-list-item-content>
                      <v-list-item-title>Tanggal</v-list-item-title>
                      <v-list-item-subtitle>{{ new Date(selectedTransaksi.tanggal.seconds * 1000).toLocaleString() }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-card-text>
              <v-card-actions>
                <v-btn color="primary" text @click="dialog = false">Tutup</v-btn>
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
        headers: [
          { text: 'Barang', value: 'barang' },
          { text: 'Jenis Transaksi', value: 'jenis' },
          { text: 'Jumlah', value: 'jumlah' },
          { text: 'Tanggal', value: 'tanggal' },
          { text: 'Aksi', value: 'actions', sortable: false }
        ],
        transaksi: [],
        selectedTransaksi: {},
      };
    },
    created() {
      this.fetchTransaksi();
    },
    methods: {
      async fetchTransaksi() {
        const snapshot = await firebase.firestore().collection('transaksi').orderBy('tanggal', 'desc').get();
        this.transaksi = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      },
      lihatDetail(item) {
        this.selectedTransaksi = item;
        this.dialog = true;
      },
    }
  };
  </script>
  
  <style scoped>
  </style>
  