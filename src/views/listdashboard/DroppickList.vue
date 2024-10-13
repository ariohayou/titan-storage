<template>
    <div>
      <v-app-bar app class="white">
        <v-btn icon @click="goBack">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <v-card-title class="headline">
          <img src="/logisly.png" alt="Logo" class="logo-small">
        </v-card-title>
      </v-app-bar>
      <v-container fluid>
        <v-card class="dashboard-card">
          <v-card-title>Droppick Dashboard</v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="searchQuery"
                  label="Search"
                  append-icon="mdi-magnify"
                  @click:append="fetchData"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-menu
                  ref="menu"
                  v-model="menu"
                  :close-on-content-click="false"
                  :return-value.sync="date"
                  transition="scale-transition"
                  offset-y
                  min-width="290px"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field
                      v-model="date"
                      label="Search by Date"
                      prepend-icon="mdi-calendar"
                      readonly
                      v-bind="attrs"
                      v-on="on"
                    ></v-text-field>
                  </template>
                  <v-date-picker v-model="date" no-title scrollable>
                    <v-spacer></v-spacer>
                    <v-btn text color="primary" @click="menu = false">Cancel</v-btn>
                    <v-btn text color="primary" @click="applyDateFilter">OK</v-btn>
                  </v-date-picker>
                </v-menu>
              </v-col>
            </v-row>
            <v-row>
              <v-col cols="12">
                <v-card class="pickup-report-card">
                  <v-card-title>Pickup Report</v-card-title>
                  <v-data-table
                    :headers="headers"
                    :items="filteredPickupData"
                    :search="searchQuery"
                    class="elevation-1"
                  ></v-data-table>
                </v-card>
              </v-col>
              <v-col cols="12">
                <v-card class="dropoff-report-card">
                  <v-card-title>Dropoff Report</v-card-title>
                  <v-data-table
                    :headers="headers"
                    :items="filteredDropoffData"
                    :search="searchQuery"
                    class="elevation-1"
                  ></v-data-table>
                </v-card>
              </v-col>
            </v-row>
            <v-btn @click="exportToExcel">Export to Excel</v-btn>
          </v-card-text>
        </v-card>
      </v-container>
    </div>
  </template>
  
  <script>
  import firebase from "firebase/app";
  import "firebase/firestore";
  import "firebase/storage";
  import * as XLSX from "xlsx";
  
  export default {
    data() {
      return {
        menu: false,
        date: null,
        searchQuery: "",
        headers: [
          { text: "Display Name", value: "displayName" },
          { text: "File Name", value: "fileName" },
          { text: "Location", value: "location" },
          { text: "Timestamp", value: "formattedTimestamp" },
        ],
        pickupData: [],
        dropoffData: [],
      };
    },
    async created() {
      await this.fetchData();
    },
    computed: {
      filteredPickupData() {
        if (this.date) {
          return this.pickupData.filter((item) =>
            item.timestamp.toDate().toLocaleDateString().includes(this.date)
          );
        }
        return this.pickupData;
      },
      filteredDropoffData() {
        if (this.date) {
          return this.dropoffData.filter((item) =>
            item.timestamp.toDate().toLocaleDateString().includes(this.date)
          );
        }
        return this.dropoffData;
      },
    },
    methods: {
      goBack() {
        this.$router.push("/home");
      },
      async fetchData() {
        const pickupRef = firebase.firestore().collection("pickups");
        const dropoffRef = firebase.firestore().collection("dropoff");
  
        const pickupSnapshot = await pickupRef.get();
        const dropoffSnapshot = await dropoffRef.get();
  
        this.pickupData = await Promise.all(
          pickupSnapshot.docs.map(async (doc) => {
            const data = doc.data();
            data.formattedTimestamp = data.timestamp.toDate().toLocaleString("en-GB", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            });
            return data;
          })
        );
  
        this.dropoffData = await Promise.all(
          dropoffSnapshot.docs.map(async (doc) => {
            const data = doc.data();
            data.formattedTimestamp = data.timestamp.toDate().toLocaleString("en-GB", {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            });
            return data;
          })
        );
      },
      applyDateFilter() {
        this.menu = false;
        this.fetchData();
      },
      exportToExcel() {
        const pickupSheet = XLSX.utils.json_to_sheet(this.filteredPickupData);
        const dropoffSheet = XLSX.utils.json_to_sheet(this.filteredDropoffData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, pickupSheet, "Pickup Data");
        XLSX.utils.book_append_sheet(workbook, dropoffSheet, "Dropoff Data");
        XLSX.writeFile(workbook, "DroppickData.xlsx");
      },
    },
  };
  </script>
  
  <style scoped>
  .dashboard-card {
    margin-top: 24px;
    padding: 16px;
  }
  
  .logo-small {
    width: 65px;
    height: 65px;
    display: block;
    margin: 10px auto;
  }
  
  .pickup-report-card, .dropoff-report-card {
    margin-top: 24px;
    padding: 16px;
  }
  </style>
  