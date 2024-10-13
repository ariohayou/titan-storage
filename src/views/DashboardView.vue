<template>
  <v-container fluid>
    <v-app-bar app class="white">
      <v-card-title class="headline">
        <v-btn icon @click="goBack">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        Admin Panel
      </v-card-title>
      <v-spacer></v-spacer>
    </v-app-bar>

    <v-container>
      <!-- Dashboard Summary -->
      <v-row>
        <v-col cols="12" sm="4">
          <v-card class="dashboard-card">
            <v-card-title class="headline">Total Stok Barang</v-card-title>
            <v-card-text>
              <v-icon large>mdi-cube</v-icon>
              <span>{{ totalStokBarang }}</span>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card class="dashboard-card">
            <v-card-title class="headline">Total Transaksi</v-card-title>
            <v-card-text>
              <v-icon large>mdi-swap-horizontal-bold</v-icon>
              <span>{{ totalTransaksi }}</span>
            </v-card-text>
          </v-card>
        </v-col>
        <v-col cols="12" sm="4">
          <v-card class="dashboard-card">
            <v-card-title class="headline">Laporan Hari Ini</v-card-title>
            <v-card-text>
              <v-icon large>mdi-file-chart</v-icon>
              <span>{{ laporanHariIni }}</span>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Menu Navigation -->
      <v-row>
        <v-col cols="12" sm="6">
          <v-card class="menu-card" @click="goToListKaryawan">
            <v-card-title class="headline">Account List</v-card-title>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script>
import { mapGetters } from 'vuex';
import Swal from 'sweetalert2';
import firebase from 'firebase/app';
import 'firebase/firestore';

export default {
  name: 'DashboardView',
  data() {
    return {
      totalStokBarang: 0,
      totalTransaksi: 0,
      laporanHariIni: 0,
    };
  },
  computed: {
    ...mapGetters(['getUserRole']),
  },
  metaInfo() {
    return {
      meta: [
        {
          name: 'requiresAuth',
          content: true,
        },
        {
          name: 'requiredRole',
          content: 'admin',
        },
      ],
    };
  },
  created() {
    this.checkUserRole();
    this.fetchDashboardData();
  },
  methods: {
    checkUserRole() {
      const userRole = this.getUserRole();
      if (userRole !== 'admin') {
        this.$router.push('/home');
        Swal.fire({
          icon: 'warning',
          title: 'Akses Ditolak',
          text: 'Anda tidak memiliki akses ke halaman ini.',
          confirmButtonText: 'OK',
        });
      }
    },

    async fetchDashboardData() {
      // Fetch total stok barang
      const barangsSnapshot = await firebase.firestore().collection('barangs').get();
      this.totalStokBarang = barangsSnapshot.size;

      // Fetch total transaksi
      const transaksiSnapshot = await firebase.firestore().collection('transaksi').get();
      this.totalTransaksi = transaksiSnapshot.size;

      // Fetch laporan hari ini
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));
      const laporanSnapshot = await firebase.firestore().collection('transaksi')
        .where('tanggal', '>=', startOfDay)
        .where('tanggal', '<=', endOfDay)
        .get();
      this.laporanHariIni = laporanSnapshot.size;
    },

    goBack() {
      this.$router.push('/home');
    },
    goToListKaryawan() {
      this.$router.push('/list-karyawan');
    },
    goToCarList() {
      this.$router.push('/carlist');
    },
    goToRentList() {
      this.$router.push('/rentlist');
    },
    goToDroppickList() {
      this.$router.push('/droppicklist');
    },
  },
};
</script>

<style scoped>
.v-card-title {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  height: 100%;
}

.menu-card {
  cursor: pointer;
  text-align: center;
  padding: 50px;
  margin-bottom: 50px;
}

.headline {
  margin-bottom: 16px;
  font-size: 30px;
  font-weight: bold;
  text-align: center;
  font-family: 'Noto Sans', sans-serif;
}

.dashboard-card {
  padding: 20px;
  margin-bottom: 20px;
  text-align: center;
}

.v-icon {
  font-size: 40px;
  margin-bottom: 10px;
}
</style>
