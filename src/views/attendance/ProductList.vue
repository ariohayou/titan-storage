<template>
    <v-container class="mt-5">
      <v-app-bar app color="primary" dark>
        <v-toolbar-title>Product List</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn color="orange" dark @click="backHome">Back</v-btn>
      </v-app-bar>
  
      <v-row class="mt-5" justify="center">
        <v-col cols="12" sm="10" md="8" class="text-center">
          <v-btn color="green" class="mb-4" @click="openAddProductDialog">Add Product</v-btn>
        </v-col>
      </v-row>
  
      <v-row justify="center">
        <v-col cols="12" sm="10" md="8">
          <v-card class="pa-4" outlined>
            <h3 class="font-weight-bold mb-3">Daftar Produk</h3>
            <v-data-table :headers="headers" :items="products" class="elevation-1" />
          </v-card>
        </v-col>
      </v-row>
  
      <v-dialog v-model="addProductDialog" max-width="500px">
        <v-card>
          <v-card-title class="headline">Add Product</v-card-title>
          <v-card-text>
            <v-form ref="productForm">
              <v-text-field v-model="newProduct.itemName" label="Item Name" outlined />
              <v-text-field v-model="newProduct.category" label="Category" outlined />
              <v-text-field v-model.number="newProduct.price" label="Price" type="number" outlined />
              <v-text-field v-model.number="newProduct.stock" label="Initial Stock" type="number" outlined />
              <v-text-field v-model.number="newProduct.minStock" label="Min Stock" type="number" outlined />
              <v-select v-model="newProduct.type" :items="['Pcs', 'Kg', 'm', 'Ltr']" label="Type" outlined />
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="red" @click="addProductDialog = false">Cancel</v-btn>
            <v-btn color="green" @click="saveProduct">Save</v-btn>
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
    data() {
      return {
        products: [],
        addProductDialog: false,
        newProduct: {
          itemName: '',
          category: '',
          price: 0,
          stock: 0,
          minStock: 5,
          type: ''
        },
        headers: [
          { text: 'Item Name', value: 'itemName' },
          { text: 'Category', value: 'category' },
          { text: 'Price', value: 'price' },
          { text: 'Stock', value: 'stock' },
          { text: 'Min Stock', value: 'minStock' },
          { text: 'Type', value: 'type' }
        ]
      };
    },
    created() {
      this.fetchProducts();
    },
    methods: {
      async fetchProducts() {
        const snapshot = await firebase.firestore().collection("products").get();
        this.products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      },
      openAddProductDialog() {
        this.newProduct = {
          itemName: '',
          category: '',
          price: 0,
          stock: 0,
          minStock: 5,
          type: ''
        };
        this.addProductDialog = true;
      },
      async saveProduct() {
        const data = { ...this.newProduct, timestamp: firebase.firestore.FieldValue.serverTimestamp() };
        const ref = await firebase.firestore().collection("products").add(data);
        this.products.push({ id: ref.id, ...this.newProduct });
        this.addProductDialog = false;
        Swal.fire("Berhasil", "Produk berhasil ditambahkan", "success");
      },
      backHome() {
        this.$router.push('/home');
      }
    }
  };
  </script>
  
  <style scoped>
  .font-weight-bold { font-weight: bold; }
  .v-app-bar { background-color: #6200ea !important; }
  .pa-4 { padding: 16px !important; }
  </style>
  