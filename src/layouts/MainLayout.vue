<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="leftDrawerOpen = !leftDrawerOpen" />

        <q-toolbar-title>P2P Divisas</q-toolbar-title>

        <div class="q-mr-md">
          {{ userName }}
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list padding>
        <q-item-label header>Menú principal</q-item-label>

        <q-item clickable v-ripple to="/dashboard">
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>
          <q-item-section>Dashboard</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/billeteras">
          <q-item-section avatar>
            <q-icon name="account_balance_wallet" />
          </q-item-section>
          <q-item-section>Billeteras</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/cuentas-bancarias">
          <q-item-section avatar>
            <q-icon name="account_balance" />
          </q-item-section>
          <q-item-section> Cuentas Bancarias </q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/mercado">
          <q-item-section avatar>
            <q-icon name="currency_exchange" />
          </q-item-section>
          <q-item-section>Mercado P2P</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/ofertas/crear">
          <q-item-section avatar>
            <q-icon name="add_business" />
          </q-item-section>
          <q-item-section>Crear Oferta</q-item-section>
        </q-item>

        <q-item clickable v-ripple to="/mis-ofertas">
          <q-item-section avatar>
            <q-icon name="list_alt" />
          </q-item-section>
          <q-item-section>Mis Ofertas</q-item-section>
        </q-item>

        <q-item clickable to="/historial">
          <q-item-section avatar>
            <q-icon name="history" />
          </q-item-section>

          <q-item-section> Historial </q-item-section>
        </q-item>

        <q-item v-if="userRole === 'ADM'" clickable v-ripple to="/admin">
          <q-item-section avatar>
            <q-icon name="admin_panel_settings" />
          </q-item-section>
          <q-item-section>Admin Movimientos</q-item-section>
        </q-item>

        <q-separator class="q-my-md" />

        <q-item clickable v-ripple @click="logout">
          <q-item-section avatar>
            <q-icon name="logout" color="negative" />
          </q-item-section>
          <q-item-section class="text-negative">Cerrar sesión</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const leftDrawerOpen = ref(false)

const userName = localStorage.getItem('userName') || 'Usuario'
const userRole = localStorage.getItem('userRole') || 'USU'

const logout = () => {
  localStorage.clear()
  router.push('/login')
}
</script>
