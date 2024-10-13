import Vue from "vue";
import VueRouter from "vue-router";
import AppLayout from "@src/layouts/AppLayout.vue";
import Home from "@src/views/HomeView.vue";
import Login from "@/views/auth/LoginView.vue";
import Register from "@/views/auth/RegisterView.vue";
import Karyawan from "@/views/employee/KaryawanView.vue";
import Pickup from "@/views/attendance/Pickup.vue";
import Dropoff from "@/views/attendance/Dropoff.vue";
import Dashboard from "@/views/DashboardView.vue";
import ListKaryawan from "@/views/listdashboard/ListKaryawanView.vue";
import CarList from "../views/listdashboard/CarList.vue";
import RentList from "../views/listdashboard/RentList.vue";
import RegisterView from "../views/auth/RegisterView.vue";
import DroppickList from "../views/listdashboard/DroppickList.vue";
import ManageBarang from "../views/attendance/ManageBarang.vue";
import ManageStok from "../views/attendance/ManageStok.vue";
import RiwayatTransaksi from "../views/attendance/RiwayatTransaksi.vue";
import Laporan from "../views/attendance/Laporan.vue";
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    component: AppLayout,
    children: [
      {
        path: "",
        redirect: "/login"
      },
      {
        path: "/login",
        component: Login
      },
      {
        path: "/register",
        component: Register
      },
      {
        path: "/home",
        component: Home
      },
      {
        path: '/dashboard',
        component: Dashboard,
        meta: { userRole: 'admin' },
      },
      {
        path:'/droppicklist',
        component:DroppickList
      },
      {
        path: "/register",
        component: RegisterView
      },
      {
        path: "/list-karyawan",
        component: ListKaryawan
      },
      {
        path: "/karyawan",
        component: Karyawan
      },
      {
        path: "/pickup",
        component: Pickup
      },
      {
        path: "/dropoff",
        component: Dropoff
      },
      {
        path: "/carlist",
        component: CarList
      },
      {
        path: "/rentlist",
        component: RentList
      },
      {
        path: "/managebarang",
        component: ManageBarang
      },  
      {
        path: "/managestok",
        component: ManageStok
      },      
      {
        path: "/riwayattransaksi",
        component: RiwayatTransaksi
      },          
      {
        path: "/laporan",
        component: Laporan
      },
    ]
  }
];

const router = new VueRouter({
  routes
});

router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn");
  const userRole = localStorage.getItem("userRole");
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    // Periksa jika pengguna belum login
    if (!isLoggedIn) {
      next("/login");
    } else {
      // Periksa jika pengguna bukan admin
      if (userRole !== "admin") {
        next("/home");
      } else {
        next();
      }
    }
  } else {
    next();
  }
});

export default router;
