<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="header-bar">
      <q-toolbar>
        <q-btn
          v-if="!isAdminPage"
          flat
          dense
          round
          icon="menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title class="logo-title">P2P Divisas</q-toolbar-title>

        <div class="user-section q-mr-md">
          <div class="user-info q-mr-md">
            <div class="user-name text-weight-bold">{{ userName }}</div>
            <div class="user-role text-caption">
              {{ userRole === 'ADM' ? 'Administrador' : 'Usuario' }}
            </div>
          </div>
          <q-avatar
            :icon="userAvatar.icon"
            :color="userAvatar.color"
            text-color="white"
            size="40px"
          />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-if="!isAdminPage" v-model="leftDrawerOpen" show-if-above bordered>
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
          <q-item-section>Admin Panel</q-item-section>
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
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const leftDrawerOpen = ref(false)

const userName = localStorage.getItem('userName') || 'Usuario'
const userRole = localStorage.getItem('userRole') || 'USU'

// Verifica si estamos en el menú principal de admin (oculta drawer solo en /admin)
const isAdminPage = computed(() => {
  return route.path === '/admin'
})

// Avatar del usuario con color aleatorio
const userAvatar = computed(() => {
  const colors = ['blue', 'purple', 'teal', 'orange', 'indigo', 'green']
  const userNameHash = userName.charCodeAt(0)
  const color = colors[userNameHash % colors.length]
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return {
    icon: undefined,
    text: initials,
    color: color,
  }
})

const logout = () => {
  localStorage.clear()
  router.push('/login')
}
</script>

<style scoped>
.header-bar {
  background: #0b0e11;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.5);
  border-bottom: 1px solid rgba(252, 213, 53, 0.1);
}

.logo-title {
  font-size: 20px;
  font-weight: bold;
  color: #eaecef;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-info {
  text-align: right;
  color: #eaecef;
}

.user-name {
  font-size: 14px;
}

.user-role {
  color: #848e9c;
  font-size: 12px;
}
</style>
