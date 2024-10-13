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
      <v-card class="dropoff-card">
        <v-card-text>
          <v-row align="center" justify="center">
            <v-col cols="6">
              <!-- Date Time -->
              <v-card class="menu-card">
                <v-row align="center">
                  <v-col cols="12">
                    <h1 class="menu-title">DROP OFF TIME</h1>
                    <div class="dropoff-header">
                      <h2>{{ currentTime }}</h2>
                      <h3>{{ formattedDate }}</h3>
                    </div>
                    <div class="dropoff-user">
                      <h3>{{ userData && userData.displayName }}</h3>
                    </div>
                  </v-col>
                </v-row>
              </v-card>

              <!-- Location -->
              <v-card class="menu-card">
                <v-row align="center">
                  <v-col cols="12">
                    <div class="dropoff-location">
                      <h4>{{ currentLocation }}</h4>
                      <div ref="mapElement" class="map-element"></div>
                    </div>
                  </v-col>
                </v-row>
              </v-card>

              <!-- Foto -->
              <v-card class="menu-card">
                <v-row align="center">
                  <v-col cols="12">
                    <div class="dropoff-photo">
                      <div class="photo-preview" v-if="photoDataUrl">
                        <img :src="photoDataUrl" alt="Preview">
                        <p>{{ capturedFileName }}</p>
                      </div>
                      <video ref="videoElement" class="video-preview" v-else></video>
                      <v-btn color="error" dark icon @click="capturePhoto" v-if="!photoDataUrl">
                        <v-icon>mdi-camera</v-icon>
                      </v-btn>
                    </div>
                  </v-col>
                </v-row>
              </v-card>

              <!-- Submit Drop Off Button -->
              <v-card class="menu-card">
                <v-row align="center">
                  <v-col cols="12">
                    <div class="dropoff-actions">
                      <v-btn color="#19A7CE" @click="submitDropOff" style="color: white;">Drop Off</v-btn>
                    </div>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<script>
import firebase from "firebase/app";
import "firebase/auth";
import { db, storage } from "@/main";
import Swal from "sweetalert2";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default {
  name: "DropOff",
  data() {
    return {
      userData: null,
      formattedDate: "",
      currentTime: "",
      currentLocation: "",
      photoDataUrl: null,
      capturedFileName: ""
    };
  },
  async created() {
    const user = firebase.auth().currentUser;
    if (user) {
      await this.setUserData();
      this.getCurrentDateTime();
      this.getCurrentLocation();
    } else {
      console.error("User not logged in.");
      this.$router.push("/home");
    }
  },

  methods: {
    goBack() {
      this.$router.push("/home");
    },
    async setUserData() {
      const user = firebase.auth().currentUser;
      if (user) {
        const registrationSnapshot = await db
          .collection("registrations")
          .where("email", "==", user.email)
          .get();
        if (!registrationSnapshot.empty) {
          // Hanya mengambil data pertama jika ada multiple dokumen dengan email yang sama
          const registrationData = registrationSnapshot.docs[0].data();
          this.userData = registrationData;
        } else {
          console.error("User data not found.");
        }
      } else {
        console.error("User not logged in.");
        this.$router.push("/login");
      }
    },
    getCurrentDateTime() {
      const currentDate = new Date();
      this.formattedDate = currentDate.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      });
      this.currentTime = currentDate.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
    },
    getCurrentLocation() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;
            this.currentLocation = `Latitude: ${latitude}, Longitude: ${longitude}`;

            this.showMap(latitude, longitude);
          },
          (error) => {
            console.error("Error getting current location:", error);
          }
        );
      } else {
        console.error("Geolocation is not supported by this browser.");
      }
    },
    capturePhoto() {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          const videoElement = this.$refs.videoElement;
          videoElement.srcObject = stream;
          videoElement.onloadedmetadata = () => {
            videoElement.play();
          };

          const track = stream.getVideoTracks()[0];
          const imageCapture = new ImageCapture(track);

          // Mengambil foto ketika tombol "Take Photo" diklik
          const takePhotoButton = document.createElement("button");
          takePhotoButton.textContent = "Take Photo";
          takePhotoButton.id = "btn-photo"
          takePhotoButton.style.cssText = "display: inline-block;padding: 10px 20px;border-radius: 20px;background-color: #3f51b5;color: white;text-decoration: none;margin: 10px;"
          takePhotoButton.addEventListener("click", async () => {
            try {
              const photoBlob = await imageCapture.takePhoto();
              this.handleCapturedPhoto(photoBlob);
            } catch (error) {
              console.error("Error capturing photo:", error);
              Swal.fire({
                icon: "error",
                title: "Error",
                text: "An error occurred while capturing the photo",
              });
            }
          });

          // Menampilkan tombol "Take Photo" di atas video preview
          videoElement.insertAdjacentElement("afterend", takePhotoButton);
        })
        .catch((error) => {
          console.error("Error accessing camera:", error);
        });
    },
    handleCapturedPhoto(photoBlob) {
      const photoUrl = URL.createObjectURL(photoBlob);
      this.photoDataUrl = photoUrl;
      this.capturedFileName = `captured_${Date.now()}.jpg`;
    },
    uploadPhoto(dataUrl, fileName) {
      const user = firebase.auth().currentUser;
      const storageRef = storage.ref();
      const photoRef = storageRef.child(`dropoff-photos/${user.uid}/${fileName}`);
      const metadata = {
        contentType: 'image/jpeg', // Ubah sesuai dengan tipe file yang kamu gunakan
      };

      fetch(dataUrl)
        .then((res) => res.blob())
        .then((blob) => {
          photoRef
            .put(blob, metadata)
            .then((snapshot) => {
              snapshot.ref.getDownloadURL().then((downloadURL) => {
                console.log(downloadURL);
              });
            })
            .catch((error) => {
              console.error("Error uploading photo:", error);
              Swal.fire({
                icon: "error",
                title: "Error",
                text: "An error occurred while uploading the photo",
              });
            });
        })
        .catch((error) => {
          console.error("Error converting data URL to blob:", error);
        });
    },

    submitDropOff() {
      const user = firebase.auth().currentUser;
      if (user && this.userData && this.userData.displayName) {
        const dropOffData = {
          displayName: this.userData.displayName,
          fileName: this.capturedFileName,
          location: this.currentLocation,
          timestamp: firebase.firestore.Timestamp.now(),
        };

        db.collection("dropoff")
          .add(dropOffData)
          .then(() => {
            if (this.photoDataUrl) {
              this.uploadPhoto(this.photoDataUrl, this.capturedFileName);
            }
            Swal.fire({
              icon: "success",
              title: "Success",
              text: "Drop Off Selesai",
            }).then(() => {
              this.goBack();
            });
          })
          .catch((error) => {
            console.error("Error submitting dropoff:", error);
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Gagal Melakukan Drop Off",
            });
          });
      } else {
        console.error("User data is missing or incomplete.");
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to submit dropoff: User data is missing or incomplete",
        });
      }
    },
    showMap(latitude, longitude) {
      const mapElement = this.$refs.mapElement;

      // Buat objek peta dengan latitude dan longitude yang diberikan
      const map = L.map(mapElement).setView([latitude, longitude], 13);

      // Tambahkan layer peta dari OpenStreetMap
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // Tambahkan penanda pada lokasi yang diberikan
      L.marker([latitude, longitude]).addTo(map)
        .bindPopup('Lokasi Drop Off')
        .openPopup();
    },
  },
};
</script>

<style scoped>
.dropoff-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px;
}

.dropoff-header {
  text-align: center;
  margin-bottom: 24px;
}

.dropoff-user {
  text-align: center;
  margin-bottom: 16px;
}

.dropoff-photo {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16px;
}

.photo-preview img {
  max-width: 300px;
  max-height: 300px;
}

.video-preview {
  width: 100%;
  max-width: 300px;
  height: auto;
}

.dropoff-location {
  text-align: center;
  margin-bottom: 16px;
}

.dropoff-actions {
  text-align: center;
}

.logo-small {
  width: 65px;
  height: 65px;
  display: block;
  margin: 0 auto;
}

.map-element {
  width: 100%;
  height: 300px;
  margin-top: 16px;
}

.dropoff-card {
  margin-top: 24px;
}

.menu-card {
  margin-bottom: 24px;
  padding: 16px;
}

.menu-icon {
  font-size: 24px;
}

.menu-title {
  margin-top: 8px;
  margin-bottom: 16px;
  text-align: center;
}

.dropoff-header {
  margin-bottom: 8px;
  text-align: center;
}

.dropoff-user {
  margin-bottom: 16px;
  text-align: center;
}

.dropoff-actions {
  text-align: center;
  margin-top: 16px;
}
</style>
