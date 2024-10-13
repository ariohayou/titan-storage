<template>
    <v-container fluid>
      <v-row justify="center">
        <v-col cols="12" sm="10" md="8">
          <v-card>
            <v-card-title>
              <span class="headline">Laporan Stok Barang</span>
            </v-card-title>
            <v-card-text>
              <v-form ref="form" v-model="valid">
                <v-select
                  v-model="jenisLaporan"
                  :items="['Stok Saat Ini', 'Riwayat Transaksi']"
                  label="Pilih Jenis Laporan"
                  outlined
                  required
                ></v-select>
                <v-menu
                  ref="menu1"
                  v-model="menu"
                  :close-on-content-click="false"
                  transition="scale-transition"
                  offset-y
                  min-width="290px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="tanggalRange"
                      label="Pilih Rentang Tanggal"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                      outlined
                    ></v-text-field>
                  </template>
                  <v-date-picker
                    v-model="dates"
                    range
                    @change="setDateRange"
                    :max="new Date().toISOString().substr(0, 10)"
                  ></v-date-picker>
                </v-menu>
                <v-btn
                  color="primary"
                  class="mt-4"
                  @click="generateLaporan"
                >Generate Laporan</v-btn>
              </v-form>
            </v-card-text>
          </v-card>
  
          <v-card v-if="laporanData.length" class="mt-4">
            <v-card-title>
              <span class="headline">Hasil Laporan: {{ jenisLaporan }}</span>
            </v-card-title>
            <v-card-text>
              <v-data-table
                :headers="headers"
                :items="laporanData"
                item-key="id"
                class="elevation-1"
              ></v-data-table>
            </v-card-text>
          </v-card>
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
        valid: false,
        jenisLaporan: '',
        tanggalRange: '',
        dates: [],
        menu: false,
        laporanData: [],
        headers: [],
      };
    },
    methods: {
      setDateRange(val) {
        this.tanggalRange = val.join(' - ');
        this.menu = false;
      },
      async generateLaporan() {
        if (this.jenisLaporan === 'Stok Saat Ini') {
          this.headers = [
            { text: 'Nama Barang', value: 'nama' },
            { text: 'Kategori', value: 'kategori' },
            { text: 'Harga', value: 'harga' },
            { text: 'Stok', value: 'stok' },
            { text: 'Satuan', value: 'satuan' },
          ];
          const snapshot = await firebase.firestore().collection('barangs').get();
          this.laporanData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } else if (this.jenisLaporan === 'Riwayat Transaksi') {
          this.headers = [
            { text: 'Barang', value: 'barang' },
            { text: 'Jenis Transaksi', value: 'jenis' },
            { text: 'Jumlah', value: 'jumlah' },
            { text: 'Tanggal', value: 'tanggal' },
          ];
          let query = firebase.firestore().collection('transaksi').orderBy('tanggal', 'desc');
          if (this.dates.length === 2) {
            query = query.where('tanggal', '>=', new Date(this.dates[0]))
                         .where('tanggal', '<=', new Date(this.dates[1]));
          }
          const snapshot = await query.get();
          this.laporanData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            tanggal: new Date(doc.data().tanggal.seconds * 1000).toLocaleString(),
          }));
        }
      },
    },
  };
  </script>
  
  <style scoped>
  </style>
  