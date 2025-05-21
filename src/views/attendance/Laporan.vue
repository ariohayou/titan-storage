<template>
  <v-container class="mb-5">
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>LIVE STOCK</v-toolbar-title>
      <v-spacer></v-spacer>
      <span>Selamat Datang, {{ displayName }}</span>
      <v-btn class="ml-4" color="orange" dark @click="logout">Log Out</v-btn>
    </v-app-bar>

    <v-row class="mt-5" justify="center">
      <v-col cols="12" sm="10" md="8">
        <v-btn color="primary" class="mb-3" @click="navigate('/home')">
          <v-icon left>mdi-arrow-left</v-icon> Back to Home
        </v-btn>

        <v-alert v-if="lowStockItems.length" type="warning" outlined>
          Produk berikut hampir habis: {{ lowStockItems.map(p => p.itemName).join(', ') }}
        </v-alert>

        <v-card class="pa-3 mb-3" color="lightblue">
          <p>Total Produk: {{ filteredItems.length }}</p>
          <p>Total Barang Masuk: {{ totalIn }}</p>
          <p>Total Barang Keluar: {{ totalOut }}</p>
          <p>Total Penjualan (estimasi): Rp {{ totalSales.toLocaleString() }}</p>
        </v-card>

        <v-row>
          <v-col cols="6">
            <v-text-field v-model="startDate" label="Start Date" type="date" outlined></v-text-field>
          </v-col>
          <v-col cols="6">
            <v-text-field v-model="endDate" label="End Date" type="date" outlined></v-text-field>
          </v-col>
        </v-row>
        <v-btn color="green" class="my-3" @click="exportToExcel">Export to Excel</v-btn>
      </v-col>
    </v-row>

    <v-row justify="center">
      <v-col cols="12" sm="10" md="8" class="text-center">
        <h2 class="font-weight-bold">LIVE STOCK</h2>
        <v-card class="pa-5" color="#e0e0e0" outlined>
          <v-data-table :headers="tableHeaders" :items="filteredItems" item-key="id" class="elevation-1">
            
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="addProductDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ isEditing ? 'Edit Product' : 'Add Product' }}</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-text-field v-model="newProduct.itemName" label="Item Name" outlined :rules="[v => !!v || 'Item Name is required']"/>
            <v-text-field v-model="newProduct.category" label="Category" outlined :rules="[v => !!v || 'Category is required']"/>
            <v-text-field v-model.number="newProduct.price" label="Price" outlined type="number" :rules="[v => !!v || 'Price is required']"/>
            <v-text-field v-model.number="newProduct.stock" label="Initial Stock" outlined type="number" :rules="[v => !!v || 'Initial stock is required']"/>
            <v-text-field v-model.number="newProduct.minStock" label="Min. Stock (Batas Aman)" outlined type="number" :rules="[v => v >= 0 || 'Min stock harus >= 0']"/>
            <v-text-field v-if="isEditing" v-model.number="newProduct.in" label="In (Jumlah Masuk)" outlined type="number"/>
            <v-text-field v-if="isEditing" v-model.number="newProduct.out" label="Out (Jumlah Keluar)" outlined type="number"/>
            <v-select v-model="newProduct.type" :items="typeOptions" label="Type" outlined :rules="[v => !!v || 'Type is required']"/>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red" @click="closeAddProductDialog">Cancel</v-btn>
          <v-btn color="green darken-1" @click="saveProduct">{{ isEditing ? 'Update' : 'Save' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="qrDialog" max-width="400px">
      <v-card>
        <v-card-title class="headline">QR Code for {{ qrItemName }}</v-card-title>
        <v-card-text class="text-center">
          <v-img :src="qrCodeDataUrl" max-width="300"></v-img>
          <p class="mt-2" style="font-size: 12px;">Scan QR untuk lihat detail produk</p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text color="red" @click="qrDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import Swal from 'sweetalert2';
import QRCode from 'qrcode';
import * as XLSX from 'xlsx';

export default {
  data() {
    return {
      displayName: '',
      startDate: '',
      endDate: '',
      tableItems: [],
      newProduct: {},
      addProductDialog: false,
      qrDialog: false,
      qrCodeDataUrl: '',
      qrItemName: '',
      isEditing: false,
      valid: false,
      typeOptions: ['Pcs', 'Kg', 'm', 'Ltr'],
      tableHeaders: [
        { text: 'Produk', value: 'itemName' },
        { text: 'Category', value: 'category' },
        { text: 'Price', value: 'price' },
        { text: 'In', value: 'in' },
        { text: 'Out', value: 'out' },
        { text: 'Stock', value: 'stock' },
        { text: 'Type', value: 'type' },
        
      ]
    };
  },
  computed: {
    filteredItems() {
      return this.tableItems.filter(item => {
        const date = item.timestamp?.toDate?.();
        const start = this.startDate ? new Date(this.startDate) : null;
        const end = this.endDate ? new Date(this.endDate) : null;
        return (!start || date >= start) && (!end || date <= end);
      });
    },
    totalIn() {
      return this.filteredItems.reduce((sum, x) => sum + (x.in || 0), 0);
    },
    totalOut() {
      return this.filteredItems.reduce((sum, x) => sum + (x.out || 0), 0);
    },
    totalSales() {
      return this.filteredItems.reduce((sum, x) => sum + ((x.out || 0) * (x.price || 0)), 0);
    },
    lowStockItems() {
      return this.filteredItems.filter(p => p.stock <= p.minStock && p.itemName && p.stock != null);
    }
  },
  created() {
    this.fetchProducts();
    this.getDisplayName();
  },
  methods: {
    navigate(route) {
      this.$router.push(route);
    },
    async getDisplayName() {
      const user = firebase.auth().currentUser;
      if (user) {
        const doc = await firebase.firestore().collection('registrations').where('email', '==', user.email).limit(1).get();
        this.displayName = doc.empty ? 'User' : doc.docs[0].data().displayName;
      }
    },
    async fetchProducts() {
      const snapshot = await firebase.firestore().collection('transactions').orderBy('timestamp', 'desc').get();
      this.tableItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    exportToExcel() {
      const exportData = this.filteredItems.map(item => ({
        Time: item.timestamp?.toDate().toLocaleString() || '',
        Action: item.action,
        "Product Name": item.itemName,
        Category: item.category,
        In: item.in,
        Out: item.out,
        Stock: item.stock,
        Type: item.type,
        Price: item.price
      }));
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
      XLSX.writeFile(workbook, "Product_Report.xlsx");
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
          firebase.auth().signOut().then(() => {
            localStorage.clear();
            this.$router.push("/login");
          });
        }
      });
    }
  }
};
</script>

<style scoped>
.font-weight-bold { font-weight: bold; }
.v-app-bar { background-color: #6200ea !important; }
.pa-5 { padding: 16px !important; }
.mx-2 { margin-left: 8px !important; margin-right: 8px !important; }
.text-center { text-align: center; }
</style>
