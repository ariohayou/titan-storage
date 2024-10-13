<template>
    <v-container>
      <v-app-bar app class="white">
        <v-card-title class="headline">
          <v-btn icon @click="goBack">
            <v-icon>mdi-arrow-left</v-icon>
          </v-btn>
          <img src="/logisly.png" alt="Logo" class="logo-small">
        </v-card-title>
      </v-app-bar>
  
      <v-row>
        <v-col>
          <v-card>
            <v-card-title>
              <v-btn color="primary" @click="dialog = true">Add Car</v-btn>
            </v-card-title>
            <v-data-table :headers="headers" :items="cars" class="elevation-1">
              <template v-slot:[`item.actions`]="{ item }">
                <v-icon small class="mr-2" @click="editCar(item)">mdi-pencil</v-icon>
                <v-icon small class="mr-2" @click="confirmDelete(item)">mdi-delete</v-icon>
              </template>
            </v-data-table>
          </v-card>
        </v-col>
      </v-row>
  
      <!-- Dialog for Add/Edit Car -->
      <v-dialog v-model="dialog" max-width="600px">
        <v-card>
          <v-card-title>
            <span class="headline">{{ formTitle }}</span>
          </v-card-title>
          <v-card-text>
            <v-form ref="form">
              <v-text-field v-model="car.code" label="Kode Mobil" :readonly="true"></v-text-field>
              <v-text-field v-model="car.type" label="Tipe Mobil"></v-text-field>
              <v-text-field v-model="car.licensePlate" label="Nomor Polisi"></v-text-field>
              <v-text-field v-model="car.rentalPrice" label="Harga Sewa" type="number"></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="blue darken-1" text @click="dialog = false">Cancel</v-btn>
            <v-btn color="blue darken-1" text @click="saveCar">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
  
      <!-- Button to download Excel file -->
      <v-row justify="end">
        <v-col cols="auto">
          <v-btn @click="downloadExcel">Download as Excel</v-btn>
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
        cars: [],
        car: {
          code: "",
          type: "",
          licensePlate: "",
          rentalPrice: ""
        },
        headers: [
          { text: "Kode Mobil", value: "code" },
          { text: "Tipe Mobil", value: "type" },
          { text: "Nomor Polisi", value: "licensePlate" },
          { text: "Harga Sewa", value: "rentalPrice" },
          { text: "Actions", value: "actions", sortable: false }
        ]
      };
    },
    computed: {
      formTitle() {
        return this.car.code ? "Edit Car" : "Add Car";
      }
    },
    methods: {
      generateCarCode() {
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const numbers = "0123456789";
        let code = "";
        for (let i = 0; i < 3; i++) {
          code += letters.charAt(Math.floor(Math.random() * letters.length));
        }
        for (let i = 0; i < 3; i++) {
          code += numbers.charAt(Math.floor(Math.random() * numbers.length));
        }
        return code;
      },
      fetchCars() {
        const db = firebase.firestore();
        db.collection("cars")
          .get()
          .then(querySnapshot => {
            const cars = [];
            querySnapshot.forEach(doc => {
              const car = doc.data();
              car.id = doc.id;
              cars.push(car);
            });
            this.cars = cars;
          })
          .catch(error => {
            console.error("Error fetching cars: ", error);
          });
      },
      editCar(car) {
        this.car = { ...car };
        this.dialog = true;
      },
      confirmDelete(car) {
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
            this.deleteCar(car);
          }
        });
      },
      deleteCar(car) {
        const db = firebase.firestore();
        db.collection("cars").doc(car.id).delete().then(() => {
          this.fetchCars();
          Swal.fire(
            'Deleted!',
            'Your file has been deleted.',
            'success'
          );
        }).catch(error => {
          console.error("Error deleting car: ", error);
        });
      },
      saveCar() {
        const db = firebase.firestore();
        if (this.car.id) {
          db.collection("cars").doc(this.car.id).update(this.car).then(() => {
            this.fetchCars();
          }).catch(error => {
            console.error("Error updating car: ", error);
          });
        } else {
          this.car.code = this.generateCarCode();
          db.collection("cars").add(this.car).then(() => {
            this.fetchCars();
          }).catch(error => {
            console.error("Error adding car: ", error);
          });
        }
        this.dialog = false;
        this.resetForm();
      },
      resetForm() {
        this.car = {
          code: "",
          type: "",
          licensePlate: "",
          rentalPrice: ""
        };
        this.$refs.form.reset();
      },
      downloadExcel() {
        const ws = XLSX.utils.json_to_sheet(this.cars);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "CarList");
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        saveAs(new Blob([wbout], { type: "application/octet-stream" }), "CarList.xlsx");
      },
      goBack() {
        this.$router.go(-1);
      }
    },
    created() {
      this.fetchCars();
    }
  };
  </script>
  
  <style scoped>
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
  