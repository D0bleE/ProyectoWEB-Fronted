<template>
  <q-page class="q-pa-lg">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-primary">Dashboard Admin</div>
        <div class="text-grey-7">Resumen general de usuarios, monedas y movimientos.</div>
      </div>

      <q-btn
        outline
        color="primary"
        icon="refresh"
        label="Actualizar"
        :loading="loading"
        @click="cargarDashboard"
      />
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-sm-6 col-md">
        <q-card class="admin-card bg-blue-1">
          <q-card-section>
            <q-icon name="groups" size="34px" color="primary" />
            <div class="text-grey-8 q-mt-sm">Usuarios registrados</div>
            <div class="text-h4">{{ usuariosNormales.length }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md">
        <q-card class="admin-card bg-green-1">
          <q-card-section>
            <q-icon name="verified_user" size="34px" color="positive" />
            <div class="text-grey-8 q-mt-sm">Usuarios activos</div>
            <div class="text-h4">{{ usuariosActivos }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md">
        <q-card class="admin-card bg-red-1">
          <q-card-section>
            <q-icon name="person_off" size="34px" color="negative" />
            <div class="text-grey-8 q-mt-sm">Usuarios deshabilitados</div>
            <div class="text-h4">{{ usuariosDeshabilitados }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md">
        <q-card class="admin-card bg-orange-1">
          <q-card-section>
            <q-icon name="fact_check" size="34px" color="orange" />
            <div class="text-grey-8 q-mt-sm">Movimientos pendientes</div>
            <div class="text-h4">{{ movimientosPendientes.length }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md">
        <q-card class="admin-card bg-purple-1">
          <q-card-section>
            <q-icon name="paid" size="34px" color="purple" />
            <div class="text-grey-8 q-mt-sm">Monedas activas</div>
            <div class="text-h4">{{ monedasActivas }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mt-md">
      <div class="col-12 col-md-6">
        <q-card class="admin-card">
          <q-card-section>
            <div class="text-h6 q-mb-md">Accesos rápidos</div>

            <div class="column q-gutter-sm">
              <q-btn
                color="primary"
                icon="fact_check"
                label="Revisar movimientos"
                to="/admin/movimientos"
              />
              <q-btn
                outline
                color="primary"
                icon="groups"
                label="Gestionar usuarios"
                to="/admin/usuarios"
              />
              <q-btn
                outline
                color="primary"
                icon="paid"
                label="Gestionar monedas"
                to="/admin/monedas"
              />
              <q-btn
                outline
                color="grey-8"
                icon="manage_search"
                label="Historial admin"
                to="/admin/historial"
              />
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-6">
        <q-card class="admin-card">
          <q-card-section>
            <div class="text-h6 q-mb-md">Movimientos pendientes</div>

            <q-list bordered separator v-if="movimientosPendientes.length">
              <q-item v-for="mov in movimientosPendientes.slice(0, 5)" :key="mov.id">
                <q-item-section>
                  <q-item-label>
                    {{ mov.usuarioNombre }}
                  </q-item-label>
                  <q-item-label caption>
                    {{ mov.tipoMovimiento }} - {{ mov.monedaCodigo }}
                    {{ Number(mov.monto).toFixed(2) }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-chip
                    :color="mov.tipoMovimiento === 'RECARGA' ? 'positive' : 'negative'"
                    text-color="white"
                    dense
                  >
                    {{ mov.tipoMovimiento }}
                  </q-chip>
                </q-item-section>
              </q-item>
            </q-list>

            <q-banner v-else class="bg-grey-2 text-grey-8 rounded-borders">
              No hay movimientos pendientes.
            </q-banner>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-banner v-if="errorMessage" class="bg-red-1 text-negative q-mt-md rounded-borders">
      {{ errorMessage }}
    </q-banner>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { obtenerUsuariosAdmin } from 'src/services/usuarios.service'
import { obtenerSolicitudesPendientes } from 'src/services/movimientos.service'
import { obtenerMonedasAdmin } from 'src/services/monedasAdmin.service'

const loading = ref(false)
const errorMessage = ref('')

const usuarios = ref([])
const movimientosPendientes = ref([])
const monedas = ref([])
const usuariosNormales = computed(() => usuarios.value.filter((u) => u.rol !== 'ADM'))

const usuariosActivos = computed(() => usuariosNormales.value.filter((u) => u.activo).length)

const usuariosDeshabilitados = computed(
  () => usuariosNormales.value.filter((u) => !u.activo).length,
)

const monedasActivas = computed(() => monedas.value.filter((m) => m.activo).length)

const cargarDashboard = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    const [usuariosData, movimientosData, monedasData] = await Promise.all([
      obtenerUsuariosAdmin(),
      obtenerSolicitudesPendientes(),
      obtenerMonedasAdmin(),
    ])

    usuarios.value = usuariosData
    movimientosPendientes.value = movimientosData
    monedas.value = monedasData
  } catch (error) {
    console.error(error)
    errorMessage.value = 'No se pudo cargar el dashboard administrativo.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  cargarDashboard()
})
</script>

<style scoped>
.admin-card {
  border-radius: 16px;
  min-height: 150px;
}
</style>
