<template>
  <v-container class="mb-5">
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>LIVE STOCK</v-toolbar-title>
      <v-spacer></v-spacer>
      <span>Selamat Datang, Admin</span>
      <v-btn class="ml-4" color="orange" dark @click="logout">Log Out</v-btn>
    </v-app-bar>

    <v-row class="mt-5" justify="center">
      <v-col cols="12" sm="8" md="6" class="text-center">
        <v-btn color="primary" class="mx-2" @click="openAddProductDialog">Add Product</v-btn>
        <v-btn color="primary" class="mx-2" @click="navigate('/laporan')">View Report</v-btn>
        <v-btn color="primary" class="mx-2" @click="navigate('/register')">Register Account</v-btn>
      </v-col>
    </v-row>

    <v-row class="mt-5" justify="center">
      <v-col cols="12" sm="10" md="8" class="text-center">
        <h2 class="font-weight-bold">LIVE STOCK</h2>
        <v-card class="pa-5" color="#e0e0e0" outlined>
          <v-data-table :headers="tableHeaders" :items="tableItems" item-key="id" class="elevation-1">
            <template v-slot:[`item.actions`]="{ item }">
              <v-icon small color="blue" @click="openEditProductDialog(item)">mdi-pencil</v-icon>
              <v-icon small color="red" @click="deleteProduct(item)">mdi-delete</v-icon>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog untuk Add/Edit Product -->
    <v-dialog v-model="addProductDialog" max-width="500px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ isEditing ? 'Edit Product' : 'Add Product' }}</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="form" v-model="valid">
            <v-text-field v-model="newProduct.itemName" label="Item Name" outlined
              :rules="[v => !!v || 'Item Name is required']"></v-text-field>
            <v-text-field v-model="newProduct.category" label="Category" outlined
              :rules="[v => !!v || 'Category is required']"></v-text-field>
            <v-text-field v-model.number="newProduct.price" label="Price" outlined type="number"
              :rules="[v => !!v || 'Price is required']"></v-text-field>
            <v-text-field v-model.number="newProduct.stock" label="Initial Stock" outlined type="number"
              :rules="[v => !!v || 'Initial stock is required']"></v-text-field>
            <v-text-field v-if="isEditing" v-model.number="newProduct.in" label="In (Jumlah Masuk)" outlined
              type="number" :rules="[v => !!v || 'In is required']"></v-text-field>
            <v-text-field v-if="isEditing" v-model.number="newProduct.out" label="Out (Jumlah Keluar)" outlined
              type="number" :rules="[v => !!v || 'Out is required']"></v-text-field>
            <v-select v-model="newProduct.type" :items="typeOptions" label="Type" outlined
              :rules="[v => !!v || 'Type is required']"></v-select>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red" @click="closeAddProductDialog">Cancel</v-btn>
          <v-btn color="green darken-1" @click="saveProduct">{{ isEditing ? 'Update' : 'Save' }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import firebase from "firebase/app";
import "firebase/firestore";
import Swal from "sweetalert2";

export default {
  name: "Home",
  data() {
    return {
      addProductDialog: false,
      valid: false,
      isEditing: false,
      newProduct: {
        id: null,
        itemName: '',
        category: '',
        price: null,
        stock: 0,
        in: 0, // Jumlah masuk baru
        out: 0, // Jumlah keluar baru
        type: '',
        timestamp: null,
      },
      typeOptions: ['Pcs', 'Kg', 'm', 'Ltr'],
      tableHeaders: [
        { text: 'Produk', value: 'itemName' },
        { text: 'Category', value: 'category' },
        { text: 'Price', value: 'price' },
        { text: 'In', value: 'in' }, // Kolom In
        { text: 'Out', value: 'out' }, // Kolom Out
        { text: 'Stock', value: 'stock' },
        { text: 'Type', value: 'type' },
        { text: 'Actions', value: 'actions', sortable: false }
      ],
      tableItems: []
    };
  },
  created() {
    this.fetchProducts();
  },
  methods: {
    async fetchProducts() {
      const snapshot = await firebase.firestore().collection("products").get();
      this.tableItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    openAddProductDialog() {
      this.isEditing = false;
      this.resetForm();
      this.addProductDialog = true;
    },
    closeAddProductDialog() {
      this.addProductDialog = false;
      this.resetForm();
    },
    async saveProduct() {
  if (this.$refs.form.validate()) {
    try {
      const timestamp = firebase.firestore.FieldValue.serverTimestamp(); // Gunakan serverTimestamp untuk Firestore

      if (this.isEditing) {
        // Ambil data produk lama dari Firebase
        const docRef = firebase.firestore().collection("products").doc(this.newProduct.id);
        const doc = await docRef.get();
        const oldData = doc.data();

        // Hitung perubahan in dan out
        const inDifference = this.newProduct.in - oldData.in;
        const outDifference = this.newProduct.out - oldData.out;

        // Perhitungan stok baru berdasarkan perubahan in dan out
        const newStock = oldData.stock + inDifference - outDifference;

        // Validasi stok tidak boleh negatif
        if (newStock < 0) {
          Swal.fire("Error!", "Stock cannot be negative.", "error");
          return;
        }

        // Update data di Firestore
        await docRef.update({
          itemName: this.newProduct.itemName,
          category: this.newProduct.category,
          price: this.newProduct.price,
          stock: newStock,
          in: this.newProduct.in,
          out: this.newProduct.out,
          type: this.newProduct.type,
          timestamp: timestamp // Menggunakan serverTimestamp untuk update
        });
        Swal.fire("Updated!", "Product updated successfully.", "success");
      } else {
        // Tambah produk baru ke Firebase
        const docRef = await firebase.firestore().collection("products").add({
          itemName: this.newProduct.itemName,
          category: this.newProduct.category,
          price: this.newProduct.price,
          stock: this.newProduct.stock,
          in: this.newProduct.in,
          out: this.newProduct.out,
          type: this.newProduct.type,
          timestamp: timestamp // Menggunakan serverTimestamp untuk penyimpanan
        });
        this.newProduct.id = docRef.id;
        Swal.fire("Saved!", "Product added successfully.", "success");
      }
      this.closeAddProductDialog();
      this.fetchProducts();
    } catch (error) {
      Swal.fire("Error!", "Failed to save product.", "error");
      console.error("Error saving product:", error);
    }
  } else {
    Swal.fire("Error!", "Please fill all required fields.", "error");
  }
}

    ,
    deleteProduct(item) {
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await firebase.firestore().collection("products").doc(item.id).delete();
            this.tableItems = this.tableItems.filter(product => product.id !== item.id);
            Swal.fire("Deleted!", "Product has been deleted.", "success");
          } catch (error) {
            Swal.fire("Error!", "Failed to delete product.", "error");
            console.error("Error deleting product:", error);
          }
        }
      });
    },
    openEditProductDialog(item) {
      this.isEditing = true;
      this.newProduct = { ...item };
      this.addProductDialog = true;
    },
    resetForm() {
      this.newProduct = {
        id: null,
        itemName: '',
        category: '',
        price: null,
        stock: 0,
        in: 0,
        out: 0,
        type: ''
      };
    },
    navigate(route) {
      this.$router.push(route);
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
          localStorage.clear();
          this.$router.push("/login");
        }
      });
    }
  }
}
</script>

<style scoped>
.font-weight-bold {
  font-weight: bold;
}

.v-app-bar {
  background-color: #6200ea !important;
}

.pa-5 {
  padding: 16px !important;
}

.mx-2 {
  margin-left: 8px !important;
  margin-right: 8px !important;
}

.text-center {
  text-align: center;
}
</style>
