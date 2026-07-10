<template>
  <q-page class="admin-main-page q-pa-lg">
    <div class="q-mb-lg">
      <div class="text-h4 text-weight-bold q-mb-sm">MENÚ PRINCIPAL</div>
      <div class="text-grey-7">Seleccione un módulo operativo para continuar.</div>
    </div>

    <div class="row q-col-gutter-lg q-mb-lg">
      <!-- Movimientos -->
      <div class="col-12 col-md-4">
        <q-card
          class="admin-menu-card cursor-pointer transition-all"
          @click="router.push('/admin/movimientos')"
        >
          <q-card-section class="flex flex-center">
            <q-icon name="payments" size="48px" color="primary" />
          </q-card-section>
          <q-card-section class="text-center">
            <div class="text-h6 text-weight-bold">Movimientos</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Usuarios -->
      <div class="col-12 col-md-4">
        <q-card
          class="admin-menu-card cursor-pointer transition-all"
          @click="router.push('/admin/usuarios')"
        >
          <q-card-section class="flex flex-center">
            <q-icon name="people" size="48px" color="info" />
          </q-card-section>
          <q-card-section class="text-center">
            <div class="text-h6 text-weight-bold">Usuarios</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Reportes -->
      <div class="col-12 col-md-4">
        <q-card
          class="admin-menu-card cursor-pointer transition-all"
          @click="router.push('/admin/reportes')"
        >
          <q-card-section class="flex flex-center">
            <q-icon name="bar_chart" size="48px" color="positive" />
          </q-card-section>
          <q-card-section class="text-center">
            <div class="text-h6 text-weight-bold">Reportes</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Ofertas Pendientes -->
      <div class="col-12 col-md-4">
        <q-card
          class="admin-menu-card cursor-pointer transition-all"
          @click="router.push('/admin/ofertas-pendientes')"
        >
          <q-card-section class="flex flex-center">
            <q-icon name="assignment_late" size="48px" color="warning" />
          </q-card-section>
          <q-card-section class="text-center">
            <div class="text-h6 text-weight-bold">Ofertas Pendientes</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Transacciones -->
      <div class="col-12 col-md-4">
        <q-card
          class="admin-menu-card cursor-pointer transition-all"
          @click="router.push('/admin/transacciones')"
        >
          <q-card-section class="flex flex-center">
            <q-icon name="swap_horiz" size="48px" color="primary" />
          </q-card-section>
          <q-card-section class="text-center">
            <div class="text-h6 text-weight-bold">Transacciones</div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Configuración -->
      <div class="col-12 col-md-4">
        <q-card
          class="admin-menu-card cursor-pointer transition-all"
          @click="router.push('/admin/configuracion')"
        >
          <q-card-section class="flex flex-center">
            <q-icon name="settings" size="48px" color="primary" />
          </q-card-section>
          <q-card-section class="text-center">
            <div class="text-h6 text-weight-bold">Configuración</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Botón Cerrar Sesión -->
    <div class="flex flex-center q-mt-xl">
      <q-btn
        outline
        color="negative"
        label="Cerrar sesión"
        icon="logout"
        size="lg"
        @click="handleLogout"
      />
    </div>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userId')
  localStorage.removeItem('userName')
  localStorage.removeItem('userEmail')
  localStorage.removeItem('userRole')
  router.push('/login')
}
</script>

<style scoped>
.admin-main-page {
  background: #0b0e11;
  min-height: 100vh;
  color: #eaecef;
}

.admin-menu-card {
  background: #1e2329;
  border: 1px solid rgba(252, 213, 53, 0.2);
  border-radius: 16px;
  transition: all 0.3s ease;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #eaecef;
}

.admin-menu-card:hover {
  background: #262d34;
  border-color: #fcd535;
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(252, 213, 53, 0.2);
}

.admin-menu-card .q-card__section {
  padding: 16px;
  width: 100%;
}

.transition-all {
  transition: all 0.3s ease;
}
</style>
