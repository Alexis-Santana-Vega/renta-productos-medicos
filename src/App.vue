<template>
  <v-app>
    <v-app-bar order="2">
      <v-app-bar-nav-icon @click.stop="openDrawer()"></v-app-bar-nav-icon>
      <v-app-bar-title v-if="!$isMobile()">Dashboard</v-app-bar-title>
      <template v-slot:append>
        <v-btn @click="controls.darkmodeModel = !controls.darkmodeModel"
          :icon="controls.darkmodeModel ? 'mdi-weather-night' : 'mdi-weather-sunny'"></v-btn>
        <v-btn icon="mdi-cart-outline" @click="controls.drawerCart = !controls.drawerCart"></v-btn>
      </template>
    </v-app-bar>
    <v-navigation-drawer v-model="controls.drawer" order="1" :rail="controls.rail" :rail-width="64">
      <template v-slot:prepend>
      </template>
      <v-list class="px-2" variant="flat" color="primary">
        <v-list-item>
          <template v-slot:prepend>
            <v-img
              src="https://static.vecteezy.com/system/resources/previews/053/066/817/non_2x/icon-free-logo-javascript-free-png.png"
              height="48" width="48" class="ml-n4 mr-4 mt-n1 rounded-circle" cover />
          </template>
          <v-list-item-title class="text-h6 font-weight-black">Renta Equipo</v-list-item-title>
        </v-list-item>
        <v-list-item v-for="(item, i) in menuItems" :key="i" :to="item.href" :value="item">
          <template v-slot:prepend>
            <v-icon class="ml-n1 mr-n2" :icon="item.icon"></v-icon>
          </template>
          <v-list-item-title>{{ item.title }}</v-list-item-title>
          <v-tooltip v-if="controls.rail" activator="parent" location="end" :text="item.title"></v-tooltip>
        </v-list-item>
      </v-list>
      <template v-slot:append>
        <v-list class="px-2">
          <v-list-item>
            <template v-slot:prepend>
              <div
                class="ml-n4 mr-4 rounded-xl text-body-1 font-weight-medium bg-tertiary text-center d-flex align-center justify-center"
                style="height: 48px; width: 48px;">
                <span>AS</span>
              </div>
            </template>
            <v-list-item-title class="font-weight-bold">Alexis Santana</v-list-item-title>
            <v-list-item-subtitle class="text-caption">Admin</v-list-item-subtitle>
          </v-list-item>
          <v-list-item @click="logout()">
            <template v-slot:prepend>
              <v-icon class="ml-n1 mr-n2" icon="mdi-logout"></v-icon>
            </template>
            <v-list-item-title>Cerrar Sesión</v-list-item-title>
            <v-tooltip v-if="controls.rail" activator="parent" location="end" text="Cerrar Sesión"></v-tooltip>
          </v-list-item>
        </v-list>
      </template>
    </v-navigation-drawer>
    <v-navigation-drawer v-model="controls.drawerCart" location="right" temporary order="0" width="320">
      <template v-slot:prepend>
        <v-toolbar class="border-b" rounded="0">
          <template v-slot:extension>
            <div class="text-body-2 text-center font-weight-bold w-100">{{ `${cartProducts} ${cartProducts === 1 ?
              'equipo' : 'equipos' }` }}</div>
          </template>
          <v-avatar icon="mdi-cart-outline" class="ml-4" />
          <v-toolbar-title>Mi Carrito</v-toolbar-title>
          <template v-slot:append>
            <v-btn icon="mdi-window-close" @click="controls.drawerCart = false"></v-btn>
          </template>
        </v-toolbar>
      </template>
      <div class="h-100" v-if="cartItems.length === 0">
        <div class="h-100 text-medium-emphasis text-center d-flex align-center">
          <div class="w-100">
            <v-icon icon="mdi-cart-outline" size="32" />
            <div class="text-body-1 font-weight-bold">Tu carrito está vacío</div>
          </div>
        </div>
      </div>
      <div v-else>
        <v-list slim>
          <v-list-item v-for="(item, i) in cartItems" :key="i">
            <template v-slot:prepend>
              <v-avatar class="mr-2">
                <v-img :src="item.photoUrl" />
              </v-avatar>
            </template>
            <v-list-item-title class="text-body-2">{{ item.name }}</v-list-item-title>
            <v-list-item-subtitle class="text-caption font-weight-medium">{{ `$ ${item.price}` }}</v-list-item-subtitle>
            <template v-slot:append>
              <span class="text-body-2 font-weight-bold">{{ `${item.stock} u.` }}</span>
            </template>
          </v-list-item>
        </v-list>
      </div>
      <template v-slot:append v-if="cartItems.length > 0">
        <v-divider></v-divider>
        <div class="pa-2">
          <div class="d-flex justify-space-between mb-2">
            <div class="text-h6 text-medium-emphasis font-weight-bold">Total</div>
            <div class="text-h6 font-weight-bold">$ 10,350.0</div>
          </div>
          <btn-custom block to="/cart">Rentar equipo médico</btn-custom>
        </div>
      </template>
    </v-navigation-drawer>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script>
import { computed, getCurrentInstance, ref } from 'vue'
import { reactive, watch } from 'vue'
import { useDisplay, useTheme } from 'vuetify'


export default {
  setup() {
    const { proxy } = getCurrentInstance()
    const globals = proxy
    const { mdAndDown } = useDisplay()
    const theme = useTheme()
    /** Data */
    const menuItems = [
      { title: "Inicio", icon: "mdi-home-outline", href: "/" },
      { title: "Equipos", icon: "mdi-hospital-box-outline", href: "/equipment" },
      { title: "Categorías", icon: "mdi-tag-outline", href: "/categories" },
      { title: "Ayuda", icon: "mdi-help-circle-outline", href: "/help" },
      { title: "Acerca de", icon: "mdi-information-variant", href: "/about" },
      { title: "Administradores", icon: "mdi-account-cog-outline", href: "/admins" },
      { title: "Usuarios", icon: "mdi-account-multiple-outline", href: "/users" },
    ]
    const cartItems = ref([
      { id: '10', name: 'Phoroptor Yeosn SLY-100', photoUrl: 'https://isem.mx/wp-content/uploads/2019/11/phoroptorpartetrasera.jpg', price: 3000.0, stock: 1 },
      { id: '20', name: 'Sistema VIOS 300s', photoUrl: 'https://www.somatechnology.com/spanish/wp-content/uploads/sites/2/2018/03/ERBE-VIO-300S-Electrobisturis-2.jpg', price: 6000.0, stock: 2 },
      { id: '30', name: 'Morcelador Gomedil 2025', photoUrl: 'https://endoscopia-gdl.com.mx/wp-content/uploads/2024/07/PAGINA-WEB-MORCELADOR-HAWK-2024.jpg', price: 1350.0, stock: 1 }
    ])
    const controls = reactive({
      rail: null,
      drawer: null,
      drawerCart: null,
      darkmodeModel: null,
    })
    /** Watchers */
    watch(() => controls.darkmodeModel, (nv) => {
      localStorage.setItem("darkModeApp", JSON.stringify(nv))
      globals.$vuetify.theme.global.name = nv ? "customDarkTheme" : "customLightTheme"
    })
    /** Computed Methods */
    const cartProducts = computed(() => cartItems.value.reduce((a, p) => { return a + p.stock }, 0))
    /** Methods */
    const openDrawer = () => {
      if (mdAndDown.value) {
        controls.drawer = !controls.drawer
        controls.rail = false
      } else {
        controls.rail = !controls.rail
      }
    }
    //const changeTheme = (n) => globals.$vuetify.theme.global.name = n
    const changeTheme = (n) => theme.global.name = n
    const getDarkMode = () => {
      const darkModeApp = JSON.parse(localStorage.getItem("darkModeApp"))
      const darkModeNav =
        window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      if (darkModeApp === null) {
        controls.darkmodeModel = darkModeNav
        localStorage.setItem("darkModeApp", JSON.stringify(darkModeNav))
      } else {
        controls.darkmodeModel = darkModeApp
      }
    }
    const logout =() => {
      globals.$swalConfirm('Cerrar sesión', 'info', '¿Desea salir de Renta Equipo?')
        .then(result => {
          if (result.isConfirmed) {
            /* Fetch */
            window.location = '/'
          }
        })
        .catch(error => globals.$toast.fire({ icon: 'error', text: 'No fue posible cerrar la sesión' }))
    }
    const initialize = () => {
      getDarkMode()
      controls.rail = !mdAndDown.value
    }
    initialize()
    return { cartItems, controls, logout, changeTheme, openDrawer, cartProducts, menuItems }
  }
}
</script>
<style>
div:where(.swal2-container) {
  z-index: 3000 !important;
}

.v-navigation-drawer {
  ::-webkit-scrollbar {
    width: 5px;
    height: 5px;
    display: none;
  }

  ::-webkit-scrollbar-thumb {
    background-color: transparent;
  }

  &:hover ::-webkit-scrollbar {
    display: initial;
  }

  &:hover ::-webkit-scrollbar-thumb {
    background-color: rgba(var(--v-theme-primary), 0.8);
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }
}
</style>