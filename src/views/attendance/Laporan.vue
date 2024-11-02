<template>
  <v-container class="mb-5">
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>Report</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn color="orange" dark @click="goHome">Back to Home</v-btn>
      <v-btn color="green" dark @click="exportToExcel">Export to Excel</v-btn>
    </v-app-bar>

    <v-row class="mt-5" justify="center">
      <v-col cols="12" sm="10" md="8">
        <v-card class="pa-5" color="#e0e0e0" outlined>
          <v-data-table :headers="tableHeaders" :items="productItems" item-key="id" class="elevation-1">
            <template v-slot:[`item.timestamp`]="{ item }">
              {{ formatTimestamp(item.timestamp) }}
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import firebase from "firebase/app";
import "firebase/firestore";
import * as XLSX from "xlsx"; // Import XLSX untuk ekspor Excel

export default {
  name: "Report",
  data() {
    return {
      productItems: [],
      tableHeaders: [
        { text: "Timestamp", value: "timestamp" },
        { text: "Product Name", value: "itemName" },
        { text: "Category", value: "category" },
        { text: "In", value: "in" },
        { text: "Out", value: "out" },
        { text: "Stock", value: "stock" },
        { text: "Type", value: "type" }
      ]
    };
  },
  created() {
    this.fetchProducts();
  },
  methods: {
    async fetchProducts() {
      const snapshot = await firebase.firestore().collection("products").orderBy("timestamp", "desc").get();
      this.productItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },
    formatTimestamp(timestamp) {
      if (timestamp && timestamp.toDate) {
        return timestamp.toDate().toLocaleString();
      }
      return "";
    },
    goHome() {
      this.$router.push("/home");
    },
    exportToExcel() {
      // Data yang akan diekspor
      const exportData = this.productItems.map(item => ({
        Timestamp: this.formatTimestamp(item.timestamp),
        "Product Name": item.itemName,
        Category: item.category,
        In: item.in,
        Out: item.out,
        Stock: item.stock,
        Type: item.type
      }));

      // Membuat worksheet dan workbook
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

      // Mengunduh file Excel
      XLSX.writeFile(workbook, "Product_Report.xlsx");
    }
  }
};
</script>

<style scoped>
.pa-5 {
  padding: 16px !important;
}

.v-app-bar {
  background-color: #6200ea !important;
}

.text-center {
  text-align: center;
}
</style>
