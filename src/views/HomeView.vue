<template>
  <v-container class="mb-5">
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>LIVE STOCK</v-toolbar-title>
      <v-spacer></v-spacer>
      <span>Selamat Datang, {{ displayName }}</span>
      <v-btn class="ml-4" color="orange" dark @click="logout">Log Out</v-btn>
    </v-app-bar>

    <v-row class="mt-5" justify="center">
      <v-col cols="12" sm="8" md="6" class="text-center">
        <v-btn color="primary" class="mx-2" @click="navigate('/product-list')">Product List</v-btn>
        <v-btn color="primary" class="mx-2" @click="openAddTransactionDialog">Add Transaction</v-btn>
        <v-btn color="primary" class="mx-2" @click="navigate('/laporan')">View Report</v-btn>
        <v-btn color="primary" class="mx-2" @click="navigate('/register')">Register Account</v-btn>
      </v-col>
    </v-row>

    <v-row class="mt-3" justify="center" align="stretch">
      <v-col cols="12" md="6">
        <v-card class="pa-4" outlined>
          <h3 class="font-weight-bold mb-3">Transaction History</h3>
          <v-data-table :headers="transactionHeaders" :items="transactions" class="elevation-1" />
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="pa-4" outlined>
          <h3 class="font-weight-bold mb-3">Current Stock</h3>
          <v-data-table :headers="productHeaders" :items="products" class="elevation-1" />
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="addTransactionDialog" max-width="500px">
      <v-card>
        <v-card-title class="headline">Tambah Transaksi</v-card-title>
        <v-card-text>
          <v-form>
            <v-select
              v-model="transaction.itemId"
              :items="productOptions"
              item-value="id"
              item-text="itemName"
              label="Pilih Item"
              outlined
            />
            <v-text-field
              v-model.number="transaction.in"
              type="number"
              label="Jumlah Masuk"
              outlined
            />
            <v-text-field
              v-model.number="transaction.out"
              type="number"
              label="Jumlah Keluar"
              outlined
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="red" @click="addTransactionDialog = false">Cancel</v-btn>
          <v-btn color="green" @click="saveTransaction">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import Swal from "sweetalert2";

export default {
  data() {
    return {
      displayName: "",
      addTransactionDialog: false,
      products: [],
      transaction: { itemId: '', in: 0, out: 0 },
      productOptions: [],
      transactions: [],
      transactionHeaders: [
        { text: 'Item', value: 'itemName' },
        { text: 'In', value: 'in' },
        { text: 'Out', value: 'out' },
        { text: 'Stock After', value: 'stock' },
        { text: 'Timestamp', value: 'timestamp' }
      ],
      productHeaders: [
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
    this.getDisplayName();
    this.fetchProductOptions();
    this.fetchTransactions();
    this.fetchProducts();
  },
  methods: {
    async getDisplayName() {
      const user = firebase.auth().currentUser;
      if (user) {
        const userDoc = await firebase.firestore().collection("registrations")
          .where("email", "==", user.email).limit(1).get();
        this.displayName = userDoc.empty ? "User" : userDoc.docs[0].data().displayName;
      }
    },
    escapeMarkdown(text) {
      return text
        .replace(/\\/g, '\\\\')
        .replace(/_/g, '\\_')
        .replace(/\*/g, '\\*')
        .replace(/\[/g, '\\[')
        .replace(/\]/g, '\\]')
        .replace(/\(/g, '\\(')
        .replace(/\)/g, '\\)')
        .replace(/~/g, '\\~')
        .replace(/`/g, '\\`')
        .replace(/>/g, '\\>')
        .replace(/#/g, '\\#')
        .replace(/\+/g, '\\+')
        .replace(/-/g, '\\-')
        .replace(/=/g, '\\=')
        .replace(/\|/g, '\\|')
        .replace(/\{/g, '\\{')
        .replace(/\}/g, '\\}')
        .replace(/\./g, '\\.')
        .replace(/!/g, '\\!');
    },
    async fetchProductOptions() {
      const snapshot = await firebase.firestore().collection("products").get();
      this.productOptions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    async fetchProducts() {
      const snapshot = await firebase.firestore().collection("products").get();
      this.products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    async fetchTransactions() {
      const snapshot = await firebase.firestore().collection("transactions")
        .orderBy("timestamp", "desc").get();
      this.transactions = snapshot.docs.map(d => ({
        ...d.data(),
        id: d.id,
        timestamp: d.data().timestamp?.toDate().toLocaleString() || '-'
      }));
    },
    openAddTransactionDialog() {
      this.transaction = { itemId: '', in: 0, out: 0 };
      this.addTransactionDialog = true;
    },
    async saveTransaction() {
      const { itemId, in: inQty, out: outQty } = this.transaction;
      if (!itemId) return Swal.fire("Error!", "Pilih item dulu.", "error");

      const productRef = firebase.firestore().collection("products").doc(itemId);
      const doc = await productRef.get();
      if (!doc.exists) return Swal.fire("Error!", "Produk tidak ditemukan.", "error");

      const product = doc.data();
      const newStock = (product.stock || 0) + (inQty || 0) - (outQty || 0);
      if (newStock < 0) return Swal.fire("Error!", "Stock tidak boleh negatif.", "error");

      await productRef.update({ stock: newStock });

      await firebase.firestore().collection("transactions").add({
        itemId,
        itemName: product.itemName,
        category: product.category,
        price: product.price,
        in: inQty,
        out: outQty,
        stock: newStock,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        type: product.type
      });

      this.addTransactionDialog = false;
      this.fetchTransactions();
      this.fetchProducts();

      let message = '✅ *Transaksi Disimpan*\n' +
        '*Item:* ' + this.escapeMarkdown(product.itemName) + '\n' +
        '*In:* ' + inQty + '\n' +
        '*Out:* ' + outQty + '\n' +
        '*Stock:* ' + newStock;

      if (newStock <= product.minStock) {
        message += '\n⚠️ ' + this.escapeMarkdown('*Stock rendah!*');
      }
      this.sendTelegramNotification(message);
    },
    async sendTelegramNotification(message) {
      const token = '8125863807:AAFhOFKxdVGKIMSpvyY6bAbUJyR8th4P3YQ';
      const chatId = '513946676'; // ganti dengan chat_id kamu
      const url = `https://api.telegram.org/bot${token}/sendMessage`;
      const payload = {
        chat_id: chatId,
        text: message,
        parse_mode: 'MarkdownV2'
      };
      try {
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } catch (error) {
        console.error('Gagal kirim ke Telegram:', error);
      }
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
.pa-4 { padding: 16px !important; }
.mx-2 { margin-left: 8px !important; margin-right: 8px !important; }
.text-center { text-align: center; }
</style>