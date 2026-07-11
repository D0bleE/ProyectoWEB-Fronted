<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-secondary text-yellow">
      <q-toolbar>
        <q-btn flat dense round icon="menu" @click="leftDrawerOpen = !leftDrawerOpen" />

        <q-toolbar-title>P2P Divisas</q-toolbar-title>

        <q-chip v-if="esAdmin" color="yellow" text-color="dark" dense class="q-mr-sm">
          ADMIN
        </q-chip>

        <div class="q-mr-md">{{ userName }}</div>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      class="app-drawer bg-secondary text-yellow"
    >
      <q-list padding class="app-drawer-list">
        <q-item-label header class="text-grey-7">
          {{ esAdmin ? 'Menú administrador' : 'Menú principal' }}
        </q-item-label>

        <!-- USUARIO -->
        <template v-if="!esAdmin">
          <q-item clickable v-ripple to="/dashboard" class="app-drawer-item">
            <q-item-section avatar><q-icon name="dashboard" color="yellow" /></q-item-section>
            <q-item-section>Dashboard</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/billeteras" class="app-drawer-item">
            <q-item-section avatar
              ><q-icon name="account_balance_wallet" color="yellow"
            /></q-item-section>
            <q-item-section>Billeteras</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/cuentas-bancarias" class="app-drawer-item">
            <q-item-section avatar><q-icon name="account_balance" color="yellow" /></q-item-section>
            <q-item-section>Cuentas Bancarias</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/mercado">
            <q-item-section avatar><q-icon name="currency_exchange" /></q-item-section>
            <q-item-section>Mercado P2P</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/ofertas/crear">
            <q-item-section avatar><q-icon name="add_business" /></q-item-section>
            <q-item-section>Crear Oferta</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/mis-ofertas">
            <q-item-section avatar><q-icon name="list_alt" /></q-item-section>
            <q-item-section>Mis Ofertas</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/matches">
            <q-item-section avatar>
              <q-icon name="handshake" />
            </q-item-section>
            <q-item-section> Mis Matches </q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/historial">
            <q-item-section avatar><q-icon name="history" /></q-item-section>
            <q-item-section>Historial</q-item-section>
          </q-item>
        </template>

        <!-- ADMIN -->
        <template v-else>
          <q-item clickable v-ripple to="/admin">
            <q-item-section avatar><q-icon name="dashboard" /></q-item-section>
            <q-item-section>Dashboard Admin</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/admin/movimientos">
            <q-item-section avatar><q-icon name="fact_check" /></q-item-section>
            <q-item-section>Movimientos</q-item-section>
          </q-item>

          <q-item clickable v-ripple :to="{ path: '/admin/usuarios' }">
            <q-item-section avatar>
              <q-icon name="groups" />
            </q-item-section>
            <q-item-section>Usuarios</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/admin/monedas">
            <q-item-section avatar><q-icon name="paid" /></q-item-section>
            <q-item-section>Monedas</q-item-section>
          </q-item>

          <q-item clickable v-ripple to="/admin/historial">
            <q-item-section avatar><q-icon name="manage_search" /></q-item-section>
            <q-item-section>Historial Admin</q-item-section>
          </q-item>
        </template>

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
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const leftDrawerOpen = ref(false)

const userName = localStorage.getItem('userName') || 'Usuario'
const userRole = localStorage.getItem('userRole') || 'USU'

const esAdmin = computed(() => userRole === 'ADM')

const logout = () => {
  localStorage.clear()
  router.push('/login')
}
</script>

<style scoped>
.app-drawer,
.app-drawer .q-drawer__content,
.app-drawer .q-drawer__inner,
.app-drawer .q-drawer__content .q-scrollarea__container,
.app-drawer .q-drawer__content .q-scrollarea__content {
  background-color: #071118 !important;
  color: #e5e8ee !important;
  border-color: rgba(240, 185, 11, 0.14) !important;
}

.app-drawer.q-drawer--bordered,
.app-drawer .q-drawer__content {
  border-right: 1px solid rgba(240, 185, 11, 0.14) !important;
  box-shadow: none !important;
  border-radius: 0 !important;
}

.app-drawer-list {
  min-height: 100%;
  padding-top: 12px;
}

.app-drawer .q-item {
  border-radius: 12px;
  margin-bottom: 6px;
  background-color: transparent;
  color: #e5e8ee;
  transition:
    background-color 0.15s ease,
    transform 0.15s ease;
}

.app-drawer .q-item:hover {
  background-color: rgba(240, 185, 11, 0.12);
  transform: translateX(2px);
}

.app-drawer .q-item.q-item--active,
.app-drawer .q-item.q-item--active:hover,
.app-drawer .q-item.active {
  background-color: rgba(240, 185, 11, 0.18);
}

.app-drawer .q-item .q-item-section,
.app-drawer .q-item--active .q-item__section,
.app-drawer .q-item__label,
.app-drawer .q-item-label {
  color: #e5e8ee;
}

.app-drawer .q-item .q-item__section,
.app-drawer .q-item .q-item__label,
.app-drawer .q-item .q-item__section span,
.app-drawer .q-item .q-item__section div {
  color: inherit;
}

.app-drawer .q-icon,
.app-drawer .q-item .q-item-section .q-icon,
.app-drawer .q-item .q-item__section .q-icon {
  color: #f0b90b !important;
}

.app-drawer .q-item-label {
  color: #9aa4b5;
  margin-bottom: 16px;
}

.app-drawer .q-separator {
  border-color: rgba(255, 255, 255, 0.08);
}

.app-drawer .text-negative {
  color: #ea5455 !important;
}
</style>
