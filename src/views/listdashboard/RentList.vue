<template>
  <v-container>
    <v-app-bar app class="white">
      <v-card-title class="headline">
        <v-btn icon @click="goBack">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <img src="/logisly.png" alt="Logo" class="logo-small">
      </v-card-title>
      <v-spacer></v-spacer>
      <v-btn color="primary" @click="dialog = true">Add Rent</v-btn>
    </v-app-bar>

    <v-row>
      <v-col>
        <v-card>
          <v-card-title>
            <span class="headline">Rent List</span>
            <v-spacer></v-spacer>
          </v-card-title>
          <div class="table-wrapper">
            <v-data-table :headers="headers" :items="rentList" class="elevation-1">
              <template v-slot:[`item.actions`]="{ item }">
                <v-icon small class="mr-2" @click="editRent(item)">mdi-pencil</v-icon>
                <v-icon small class="mr-2" @click="confirmDelete(item)">mdi-delete</v-icon>
                <v-icon small @click="printItem(item)">mdi-printer</v-icon>
              </template>
            </v-data-table>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Dialog for Add/Edit Rent -->
    <v-dialog v-model="dialog" max-width="800px">
      <v-card>
        <v-card-title>
          <span class="headline">{{ formTitle }}</span>
        </v-card-title>
        <v-card-text>
          <v-form ref="form">
            <v-text-field v-model="rent.name" label="Nama Penyewa"></v-text-field>
            <v-text-field v-model="rent.pickupAddress" label="Alamat Pickup"></v-text-field>
            <v-text-field v-model="rent.deliveryAddress" label="Alamat Pengiriman"></v-text-field>
            <v-select v-model="rent.driverName" :items="drivers" item-text="displayName" item-value="displayName" label="Nama Driver"></v-select>
            <v-select v-model="rent.carType" :items="cars" item-text="type" item-value="type" label="Tipe Mobil" @change="updateCarDetails"></v-select>
            <v-text-field v-model="rent.licensePlate" label="Nomor Polisi" readonly></v-text-field>
            <v-text-field v-model.number="rent.rentalPrice" label="Harga Sewa" type="number"></v-text-field>
            <v-text-field v-model.number="rent.pricePerKm" label="Harga per Kilometer" type="number"></v-text-field>
            <v-text-field v-model.number="rent.totalKm" label="Total Km" type="number"></v-text-field>
            <v-text-field v-model.number="rent.additionalCost" label="Biaya Tambahan" type="number"></v-text-field>
            <v-text-field v-model.number="rent.totalPrice" label="Total Harga" type="number" readonly></v-text-field>
            <v-select v-model="rent.paymentStatus" :items="['Belum Dibayar', 'Sudah Dibayar', 'Pembayaran Tertunda']" label="Status Pembayaran"></v-select>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="dialog = false">Cancel</v-btn>
          <v-btn color="blue darken-1" text @click="saveRent">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Button to download Excel file and print HTML -->
    <v-row justify="end">
      <v-col cols="auto">
        <v-btn @click="downloadExcel">Download as Excel</v-btn>
        <v-btn @click="printHTML">Print</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import firebase from "firebase/app";
import "firebase/firestore";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import Swal from 'sweetalert2';

export default {
  data() {
    return {
      dialog: false,
      rentList: [],
      rent: {
        id: "",
        name: "",
        pickupAddress: "",
        deliveryAddress: "",
        driverName: "",
        carType: "",
        licensePlate: "",
        rentalPrice: 0,
        pricePerKm: 0,
        totalKm: 0,
        totalPrice: 0,
        additionalCost: 0,
        paymentStatus: ""
      },
      headers: [
        { text: "Nama Penyewa", value: "name" },
        { text: "Alamat Pickup", value: "pickupAddress" },
        { text: "Alamat Pengiriman", value: "deliveryAddress" },
        { text: "Nama Driver", value: "driverName" },
        { text: "Tipe Mobil", value: "carType" },
        { text: "Nomor Polisi", value: "licensePlate" },
        { text: "Harga Sewa", value: "rentalPrice" },
        { text: "Harga per Kilometer", value: "pricePerKm" },
        { text: "Total Km", value: "totalKm" },
        { text: "Total Harga", value: "totalPrice" },
        { text: "Biaya Tambahan", value: "additionalCost" },
        { text: "Status Pembayaran", value: "paymentStatus" },
        { text: "Actions", value: "actions", sortable: false }
      ],
      drivers: [], // Data driver dari akun yang sudah registrasi
      cars: [] // Data mobil dari koleksi cars
    };
  },
  computed: {
    formTitle() {
      return this.rent.id ? "Edit Rent" : "Add Rent";
    }
  },
  methods: {
    updateCarDetails() {
      const car = this.cars.find(c => c.type === this.rent.carType);
      if (car) {
        this.rent.licensePlate = car.licensePlate;
        this.rent.rentalPrice = car.rentalPrice;
        this.calculateTotalPrice();
      }
    },
    calculateTotalPrice() {
      this.rent.totalPrice = Number(this.rent.rentalPrice) + Number(this.rent.additionalCost) + (Number(this.rent.pricePerKm) * Number(this.rent.totalKm));
    },
    editRent(rent) {
      this.rent = { ...rent };
      this.dialog = true;
    },
    confirmDelete(rent) {
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then((result) => {
        if (result.isConfirmed) {
          this.deleteRent(rent);
        }
      });
    },
    deleteRent(rent) {
      const db = firebase.firestore();
      db.collection("rentals").doc(rent.id).delete().then(() => {
        this.fetchRentList();
        Swal.fire(
          'Deleted!',
          'Your file has been deleted.',
          'success'
        );
      }).catch(error => {
        console.error("Error deleting rent: ", error);
      });
    },
    saveRent() {
      this.calculateTotalPrice(); // Calculate total price before saving
      const db = firebase.firestore();
      if (this.rent.id) {
        db.collection("rentals").doc(this.rent.id).update(this.rent).then(() => {
          this.fetchRentList();
        }).catch(error => {
          console.error("Error updating rent: ", error);
        });
      } else {
        db.collection("rentals").add(this.rent).then(() => {
          this.fetchRentList();
        }).catch(error => {
          console.error("Error adding rent: ", error);
        });
      }
      this.dialog = false;
      this.resetForm();
    },
    resetForm() {
      this.rent = {
        id: "",
        name: "",
        pickupAddress: "",
        deliveryAddress: "",
        driverName: "",
        carType: "",
        licensePlate: "",
        rentalPrice: 0,
        pricePerKm: 0,
        totalKm: 0,
        totalPrice: 0,
        additionalCost: 0,
        paymentStatus: ""
      };
      this.$refs.form.reset();
    },
    fetchRentList() {
      const db = firebase.firestore();
      db.collection("rentals").get().then(querySnapshot => {
        const rentList = [];
        querySnapshot.forEach(doc => {
          const rent = doc.data();
          rent.id = doc.id;
          rentList.push(rent);
        });
        this.rentList = rentList;
      }).catch(error => {
        console.error("Error fetching rent list: ", error);
      });
    },
    fetchDrivers() {
      const db = firebase.firestore();
      db.collection("registrations").where("jabatan", "==", "Driver").get().then(querySnapshot => {
        const drivers = [];
        querySnapshot.forEach(doc => {
          const driver = doc.data().displayName;
          drivers.push(driver);
        });
        this.drivers = drivers;
      }).catch(error => {
        console.error("Error fetching drivers: ", error);
      });
    },
    fetchCars() {
      const db = firebase.firestore();
      db.collection("cars").get().then(querySnapshot => {
        const cars = [];
        querySnapshot.forEach(doc => {
          const car = doc.data();
          cars.push(car);
        });
        this.cars = cars;
      }).catch(error => {
        console.error("Error fetching cars: ", error);
      });
    },
    downloadExcel() {
      const ws = XLSX.utils.json_to_sheet(this.rentList);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "RentList");
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      saveAs(new Blob([wbout], { type: "application/octet-stream" }), "RentList.xlsx");
    },
    printHTML() {
      const printContent = `
        <html>
        <head>
          <title>Rent List</title>
          <style>
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid black;
              padding: 8px;
              text-align: left;
            }
          </style>
        </head>
        <body>
          <h1>Rent List</h1>
          <table>
            <thead>
              <tr>
                <th>Nama Penyewa</th>
                <th>Alamat Pickup</th>
                <th>Alamat Pengiriman</th>
                <th>Nama Driver</th>
                <th>Tipe Mobil</th>
                <th>Nomor Polisi</th>
                <th>Harga Sewa</th>
                <th>Harga per Kilometer</th>
                <th>Total Km</th>
                <th>Total Harga</th>
                <th>Biaya Tambahan</th>
                <th>Status Pembayaran</th>
              </tr>
            </thead>
            <tbody>
              ${this.rentList.map(rent => `
                <tr>
                  <td>${rent.name}</td>
                  <td>${rent.pickupAddress}</td>
                  <td>${rent.deliveryAddress}</td>
                  <td>${rent.driverName}</td>
                  <td>${rent.carType}</td>
                  <td>${rent.licensePlate}</td>
                  <td>${rent.rentalPrice}</td>
                  <td>${rent.pricePerKm}</td>
                  <td>${rent.totalKm}</td>
                  <td>${rent.totalPrice}</td>
                  <td>${rent.additionalCost}</td>
                  <td>${rent.paymentStatus}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;
      const printWindow = window.open('', '', 'height=500, width=800');
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    },
    printItem(rent) {
      const printContent = `
        <html>
        <head>
          <title>Rent Details</title>
          <style>
            .details-table {
              width: 100%;
              border-collapse: collapse;
            }
            .details-table th, .details-table td {
              border: 1px solid black;
              padding: 8px;
              text-align: left;
            }
            .details-header {
              text-align: center;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <h1 class="details-header">Rent Details</h1>
          <table class="details-table">
            <tr>
              <th>Nama Penyewa</th>
              <td>${rent.name}</td>
            </tr>
            <tr>
              <th>Alamat Pickup</th>
              <td>${rent.pickupAddress}</td>
            </tr>
            <tr>
              <th>Alamat Pengiriman</th>
              <td>${rent.deliveryAddress}</td>
            </tr>
            <tr>
              <th>Nama Driver</th>
              <td>${rent.driverName}</td>
            </tr>
            <tr>
              <th>Tipe Mobil</th>
              <td>${rent.carType}</td>
            </tr>
            <tr>
              <th>Nomor Polisi</th>
              <td>${rent.licensePlate}</td>
            </tr>
            <tr>
              <th>Harga Sewa</th>
              <td>${rent.rentalPrice}</td>
            </tr>
            <tr>
              <th>Harga per Kilometer</th>
              <td>${rent.pricePerKm}</td>
            </tr>
            <tr>
              <th>Total Km</th>
              <td>${rent.totalKm}</td>
            </tr>
            <tr>
              <th>Total Harga</th>
              <td>${rent.totalPrice}</td>
            </tr>
            <tr>
              <th>Biaya Tambahan</th>
              <td>${rent.additionalCost}</td>
            </tr>
            <tr>
              <th>Status Pembayaran</th>
              <td>${rent.paymentStatus}</td>
            </tr>
          </table>
        </body>
        </html>
      `;
      const printWindow = window.open('', '', 'height=500, width=800');
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    },
    goBack() {
      this.$router.go(-1);
    }
  },
  created() {
    this.fetchRentList();
    this.fetchDrivers();
    this.fetchCars();
  }
};
</script>

<style scoped>
.table-wrapper {
  overflow-x: auto;
}

.headline {
  font-size: 24px;
  font-weight: bold;
}

.v-data-table {
  margin-top: 20px;
}

.logo-small {
  width: 50px;
  height: 50px;
  display: block;
  margin: 0 auto;
}
</style>
