<template>
  <q-page class="historial-page q-pa-lg">
    <div class="text-h4 text-yellow q-mb-sm">Historial</div>

    <div class="text-grey-7 q-mb-lg">Consulta tus movimientos de fondos y operaciones P2P.</div>

    <q-tabs
      v-model="tab"
      dense
      class="historial-tabs q-mb-md"
      active-color="yellow"
      indicator-color="yellow"
      align="left"
    >
      <q-tab name="movimientos" icon="account_balance_wallet" label="Movimientos" />
      <q-tab name="p2p" icon="swap_horiz" label="Operaciones P2P" />
    </q-tabs>

    <q-separator class="q-mb-md" />

    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="movimientos" class="q-pa-none">
        <q-spinner v-if="loadingMovimientos" color="primary" size="40px" />

        <q-table
          v-else
          flat
          bordered
          class="historial-table"
          :rows="movimientos"
          :columns="columnsMovimientos"
          row-key="id"
          :pagination="{ rowsPerPage: 10 }"
          no-data-label="No existen movimientos registrados."
        >
          <template #body-cell-tipoMovimiento="props">
            <q-td :props="props">
              <q-badge :color="props.row.tipoMovimiento === 'RECARGA' ? 'primary' : 'negative'">
                {{ props.row.tipoMovimiento }}
              </q-badge>
            </q-td>
          </template>

          <template #body-cell-monto="props">
            <q-td :props="props">
              {{ props.row.monedaSimbolo }}
              {{ Number(props.row.monto).toFixed(2) }}
              {{ props.row.monedaCodigo }}
            </q-td>
          </template>

          <template #body-cell-estado="props">
            <q-td :props="props">
              <q-chip :color="colorEstadoMovimiento(props.row.estado)" text-color="white">
                {{ props.row.estado }}
              </q-chip>
            </q-td>
          </template>

          <template #body-cell-rutaVoucher="props">
            <q-td :props="props">
              <q-btn
                v-if="props.row.rutaVoucher"
                flat
                round
                color="primary"
                icon="image"
                @click="verVoucher(props.row)"
              />
              <span v-else>-</span>
            </q-td>
          </template>

          <template #body-cell-fechaSolicitud="props">
            <q-td :props="props">
              <div class="fecha-hora-cell">
                <div>{{ formatearFecha(props.row.fechaSolicitud) }}</div>
                <div class="text-grey-7 text-caption">{{ formatearHora(props.row.fechaSolicitud) }}</div>
              </div>
            </q-td>
          </template>

          <template #body-cell-fechaProcesado="props">
            <q-td :props="props">
              <div class="fecha-hora-cell">
                <div>{{ formatearFecha(props.row.fechaProcesado) }}</div>
                <div class="text-grey-7 text-caption">{{ formatearHora(props.row.fechaProcesado) }}</div>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-tab-panel>

      <q-tab-panel name="p2p" class="q-pa-none">
        <q-spinner v-if="loadingP2P" color="primary" size="40px" />

        <q-table
          v-else
          flat
          bordered
          class="historial-table"
          :rows="operacionesP2P"
          :columns="columnsP2P"
          row-key="id"
          :pagination="{ rowsPerPage: 10 }"
          no-data-label="No existen operaciones P2P registradas."
        >
          <template #body-cell-rolUsuario="props">
            <q-td :props="props">
              <q-badge :color="props.row.rolUsuario === 'CREADOR' ? 'primary' : 'teal'">
                {{ props.row.rolUsuario }}
              </q-badge>
            </q-td>
          </template>

          <template #body-cell-operacion="props">
            <q-td :props="props">
              {{ props.row.monedaOrigenCodigo }} → {{ props.row.monedaDestinoCodigo }}
            </q-td>
          </template>

          <template #body-cell-montoOrigen="props">
            <q-td :props="props">
              {{ props.row.monedaOrigenSimbolo }}
              {{ Number(props.row.montoOrigen).toFixed(2) }}
            </q-td>
          </template>

          <template #body-cell-montoDestino="props">
            <q-td :props="props">
              {{ props.row.monedaDestinoSimbolo }}
              {{ Number(props.row.montoDestino).toFixed(2) }}
            </q-td>
          </template>

          <template #body-cell-estado="props">
            <q-td :props="props">
              <q-chip :color="colorEstadoP2P(props.row.estado)" text-color="white">
                {{ props.row.estado }}
              </q-chip>
            </q-td>
          </template>

          <template #body-cell-fechaPublicacion="props">
            <q-td :props="props">
              <div class="fecha-hora-cell">
                <div>{{ formatearFecha(props.row.fechaPublicacion) }}</div>
                <div class="text-grey-7 text-caption">{{ formatearHora(props.row.fechaPublicacion) }}</div>
              </div>
            </q-td>
          </template>

          <template #body-cell-fechaTransaccion="props">
            <q-td :props="props">
              <div class="fecha-hora-cell">
                <div>{{ formatearFecha(props.row.fechaTransaccion) }}</div>
                <div class="text-grey-7 text-caption">{{ formatearHora(props.row.fechaTransaccion) }}</div>
              </div>
            </q-td>
          </template>
        </q-table>
      </q-tab-panel>
    </q-tab-panels>

    <q-dialog v-model="dialogVoucher">
      <q-card class="historial-dialog-card" style="width: 650px; max-width: 95vw">
        <q-card-section class="row items-center">
          <div class="text-h6">Voucher</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section>
          <img :src="voucherSeleccionado" class="voucher-image" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { obtenerMovimientosPorUsuario } from 'src/services/movimientos.service'
import { obtenerHistorialP2P } from 'src/services/ofertas.service'

const tab = ref('movimientos')
const usuarioId = localStorage.getItem('userId')

const movimientos = ref([])
const operacionesP2P = ref([])

const loadingMovimientos = ref(false)
const loadingP2P = ref(false)

const dialogVoucher = ref(false)
const voucherSeleccionado = ref('')

const apiBaseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || ''

const columnsMovimientos = [
  { name: 'tipoMovimiento', label: 'Movimiento', field: 'tipoMovimiento', align: 'center' },
  { name: 'monedaCodigo', label: 'Moneda', field: 'monedaCodigo', align: 'center' },
  { name: 'monto', label: 'Monto', field: 'monto', align: 'right' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'fechaSolicitud', label: 'Fecha solicitud', field: 'fechaSolicitud', align: 'center' },
  { name: 'fechaProcesado', label: 'Fecha procesado', field: 'fechaProcesado', align: 'center' },
  { name: 'rutaVoucher', label: 'Voucher', field: 'rutaVoucher', align: 'center' },
]

const columnsP2P = [
  { name: 'rolUsuario', label: 'Rol', field: 'rolUsuario', align: 'center' },
  { name: 'operacion', label: 'Operación', field: 'operacion', align: 'center' },
  { name: 'montoOrigen', label: 'Monto origen', field: 'montoOrigen', align: 'right' },
  { name: 'montoDestino', label: 'Monto destino', field: 'montoDestino', align: 'right' },
  { name: 'tasaCambio', label: 'Tipo de cambio', field: 'tasaCambio', align: 'right' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  {
    name: 'fechaPublicacion',
    label: 'Fecha publicación',
    field: 'fechaPublicacion',
    align: 'center',
  },
  {
    name: 'fechaTransaccion',
    label: 'Fecha operación',
    field: 'fechaTransaccion',
    align: 'center',
  },
]

const cargarMovimientos = async () => {
  try {
    loadingMovimientos.value = true
    movimientos.value = await obtenerMovimientosPorUsuario(usuarioId)
  } finally {
    loadingMovimientos.value = false
  }
}

const cargarHistorialP2P = async () => {
  try {
    loadingP2P.value = true
    operacionesP2P.value = await obtenerHistorialP2P(usuarioId)
  } finally {
    loadingP2P.value = false
  }
}

const colorEstadoMovimiento = (estado) => {
  if (estado === 'APROBADO') return 'positive'
  if (estado === 'RECHAZADO') return 'negative'
  return 'orange'
}

const colorEstadoP2P = (estado) => {
  if (estado === 'COMPLETADO') return 'positive'
  if (estado === 'CANCELADO') return 'negative'
  return 'orange'
}

const formatearFecha = (valor) => {
  if (!valor) return '-'

  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return valor

  return fecha.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const formatearHora = (valor) => {
  if (!valor) return '-'

  const fecha = new Date(valor)
  if (Number.isNaN(fecha.getTime())) return valor

  return fecha.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const verVoucher = (movimiento) => {
  voucherSeleccionado.value = `${apiBaseUrl}${movimiento.rutaVoucher}`
  dialogVoucher.value = true
}

onMounted(() => {
  cargarMovimientos()
  cargarHistorialP2P()
})
</script>

<style scoped>
.historial-page {
  background-color: #090c16;
}

.historial-tabs .q-tab {
  color: #e5e8ee !important;
}

.historial-tabs .q-tab.q-tab--active {
  color: #f0b90b !important;
}

.historial-table,
.historial-table .q-table__top,
.historial-table .q-table__middle,
.historial-table .q-table__bottom,
.historial-table .q-table__grid,
.historial-table table,
.historial-table thead,
.historial-table tbody,
.historial-table tr,
.historial-table th,
.historial-table td,
.historial-table .q-th,
.historial-table .q-td,
.historial-table .q-table__middle .q-scrollarea__content,
.historial-table .q-table__middle .q-scrollarea__container,
.historial-table .q-table__bottom .q-btn,
.historial-table .q-table__top .q-btn {
  background-color: #0f1620 !important;
  color: #e5e8ee !important;
  border-color: rgba(255, 255, 255, 0.08) !important;
}

.historial-table thead th,
.historial-table .q-th {
  background-color: #101820 !important;
  color: #f0b90b !important;
}

.historial-table tbody tr:hover,
.historial-table .q-tr:hover {
  background-color: rgba(240, 185, 11, 0.08) !important;
}

.historial-table .q-table__empty,
.historial-table tbody tr.q-table__empty-row {
  background-color: #0f1620 !important;
}

.historial-table .q-td {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.historial-table .q-tr:hover {
  background-color: rgba(240, 185, 11, 0.08) !important;
}

.historial-table .q-badge,
.historial-table .q-chip {
  font-weight: 600;
}

.historial-dialog-card {
  background-color: #121826;
  color: #e5e8ee;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.voucher-image {
  width: 100%;
  border-radius: 12px;
}

.fecha-hora-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
  line-height: 1.2;
}
</style>
