<template>
  <v-container class="mb-5">
    <v-app-bar app class="white">
      <v-card-title class="headline">
        <img src="/logisly.png" alt="Logo" class="logo-small">
      </v-card-title>
      <v-toolbar-title class="ml-8 clickable" @click="navigateHome">Home</v-toolbar-title>
      <v-toolbar-title class="ml-8 clickable" @click="navigateDashboard" v-if="isAdmin">Dashboard</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn class="mr-8" color="red" dark @click="logout">Log Out</v-btn>
    </v-app-bar>
    <v-row v-if="login">
      <v-col cols="4" sm="4" md="4" lg="4" v-for="menu in menus" :key="menu.title">
        <v-card class="menu-card" @click="navigate(menu.route)">
          <v-img :src="menu.icon" class="menu-icon"></v-img>
          <v-card-title class="menu-title">{{ menu.title }}</v-card-title>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-if="!login">
      <!-- Tampilan jika tidak login -->
    </v-row>
  </v-container>
</template>

<script>
import Swal from "sweetalert2";

export default {
  name: "Home",
  data() {
    return {
      login: true,
      isAdmin: false,
      menus: [
        {
          title: "Manage Barang",
          icon: "/path/to/menu3-icon.png",
          route: "/managebarang"
        },
        {
          title: "Manage Stok",
          icon: "/path/to/menu5-icon.png",
          route: "/managestok"
        },
        {
          title: "Riwayat Transaksi",
          icon: "/path/to/menu6-icon.png",
          route: "/riwayattransaksi"
        },
        {
          title: "Laporan",
          icon: "/path/to/menu7-icon.png",
          route: "/laporan"
        }
      ]
    };
  },
  methods: {
    navigate(route) {
      // Routing ke tujuan
      this.$router.push(route);
    },
    navigateDashboard() {
      this.$router.push("/dashboard");
    },
    navigateHome() {
      // Routing ke Home
      this.$router.push("/home");
    },
    logout() {
      Swal.fire({
        title: "Konfirmasi",
        text: "Anda yakin ingin keluar?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Keluar",
        cancelButtonText: "Batal"
      }).then(result => {
        if (result.isConfirmed) {
          // Log out dan routing ke LoginView
          localStorage.clear();
          this.$router.push("/login");
        }
      });
    }
  },
  created() {
    if (localStorage.role) {
      this.isAdmin = localStorage.role === "Admin";
    } 
  }
}
</script>

<style scoped>
.menu-card {
  cursor: pointer;
  text-align: center;
  padding: 16px;
  margin-bottom: 16px;
}

.menu-icon {
  height: 80px;
}

.menu-title {
  margin-top: 16px;
}

.logo-small {
  width: 50px;
  height: 50px;
  display: block;
  margin: 0 auto;
}

.clickable {
  cursor: pointer;
}
</style>
