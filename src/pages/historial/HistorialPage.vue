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

    <q-tab-panels v-model="tab" animated class="historial-panels">
      <q-tab-panel name="movimientos" class="q-pa-none">
        <div v-if="loadingMovimientos" class="row justify-center q-pa-xl">
          <q-spinner color="yellow" size="40px" />
        </div>

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
              {{ Number(props.row.monto || 0).toFixed(2) }}
              {{ props.row.monedaCodigo }}
            </q-td>
          </template>

          <template #body-cell-estado="props">
            <q-td :props="props">
              <q-chip :color="colorEstadoMovimiento(props.row.estado)" text-color="white" dense>
                {{ props.row.estado }}
              </q-chip>
            </q-td>
          </template>

          <template #body-cell-fechaSolicitud="props">
            <q-td :props="props">{{ formatearFecha(props.row.fechaSolicitud) }}</q-td>
          </template>

          <template #body-cell-fechaProcesado="props">
            <q-td :props="props">{{ formatearFecha(props.row.fechaProcesado) }}</q-td>
          </template>

          <template #body-cell-rutaVoucher="props">
            <q-td :props="props">
              <q-btn
                v-if="props.row.rutaVoucher"
                flat
                round
                color="yellow"
                icon="image"
                @click="verVoucher(props.row)"
              >
                <q-tooltip>Ver voucher</q-tooltip>
              </q-btn>
              <span v-else class="text-grey-6">No aplica</span>
            </q-td>
          </template>
        </q-table>
      </q-tab-panel>

      <q-tab-panel name="p2p" class="q-pa-none">
        <div v-if="loadingP2P" class="row justify-center q-pa-xl">
          <q-spinner color="yellow" size="40px" />
        </div>

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

          <template #body-cell-creadorNombre="props">
            <q-td :props="props">
              <div class="text-weight-medium">{{ props.row.creadorNombre || '-' }}</div>
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
              {{ Number(props.row.montoOrigen || 0).toFixed(2) }}
              {{ props.row.monedaOrigenCodigo }}
            </q-td>
          </template>

          <template #body-cell-montoDestino="props">
            <q-td :props="props">
              {{ props.row.monedaDestinoSimbolo }}
              {{ Number(props.row.montoDestino || 0).toFixed(2) }}
              {{ props.row.monedaDestinoCodigo }}
            </q-td>
          </template>

          <template #body-cell-tasaCambio="props">
            <q-td :props="props">{{ Number(props.row.tasaCambio || 0).toFixed(4) }}</q-td>
          </template>

          <template #body-cell-estado="props">
            <q-td :props="props">
              <q-chip :color="colorEstadoP2P(props.row.estado)" text-color="white" dense>
                {{ props.row.estado }}
              </q-chip>
            </q-td>
          </template>

          <template #body-cell-fechaPublicacion="props">
            <q-td :props="props">{{ formatearFecha(props.row.fechaPublicacion) }}</q-td>
          </template>

          <template #body-cell-fechaTransaccion="props">
            <q-td :props="props">{{ formatearFecha(props.row.fechaTransaccion) }}</q-td>
          </template>

          <template #body-cell-calificacion="props">
            <q-td :props="props">
              <q-btn
                v-if="props.row.puedeCalificar"
                color="amber-8"
                text-color="black"
                icon="star"
                label="Calificar"
                dense
                @click="abrirCalificacion(props.row)"
              />

              <div v-else-if="props.row.yaCalifico" class="column items-center">
                <q-rating
                  readonly
                  color="amber"
                  :model-value="Number(props.row.calificacionDada || 0)"
                  :max="5"
                  size="18px"
                />
                <span class="text-caption text-grey-6">Ya calificaste</span>
              </div>

              <span v-else class="text-grey-6">No disponible</span>
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

        <q-separator />

        <q-card-section>
          <img
            v-if="voucherSeleccionado && !voucherError"
            :src="voucherSeleccionado"
            class="voucher-image"
            @error="voucherError = true"
          />

          <q-banner v-if="voucherError" class="bg-red-1 text-negative rounded-borders">
            No se pudo encontrar el archivo del voucher.
          </q-banner>
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialogCalificacion" persistent>
      <q-card class="calificacion-card">
        <q-card-section class="row items-center">
          <div>
            <div class="text-h6">Calificar ofertante</div>
            <div class="text-grey-6">
              {{ operacionSeleccionada?.creadorNombre || 'Usuario' }}
            </div>
          </div>

          <q-space />

          <q-btn
            flat
            round
            dense
            icon="close"
            :disable="guardandoCalificacion"
            @click="cerrarCalificacion"
          />
        </q-card-section>

        <q-separator />

        <q-card-section class="text-center">
          <div class="text-subtitle2 q-mb-md">¿Cómo fue tu experiencia con este usuario?</div>

          <q-rating
            v-model="formCalificacion.puntuacion"
            color="amber"
            icon="star_border"
            icon-selected="star"
            :max="5"
            size="42px"
          />

          <div class="text-grey-6 q-mt-sm">{{ textoPuntuacion }}</div>

          <q-input
            v-model.trim="formCalificacion.comentario"
            outlined
            type="textarea"
            label="Comentario opcional"
            maxlength="300"
            counter
            autogrow
            class="q-mt-lg"
          />

          <q-banner v-if="errorCalificacion" class="bg-red-1 text-negative q-mt-md rounded-borders">
            {{ errorCalificacion }}
          </q-banner>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            color="grey-5"
            label="Cancelar"
            :disable="guardandoCalificacion"
            @click="cerrarCalificacion"
          />

          <q-btn
            color="amber-8"
            text-color="black"
            icon="send"
            label="Enviar calificación"
            :loading="guardandoCalificacion"
            :disable="formCalificacion.puntuacion < 1"
            @click="guardarCalificacion"
          >
            <q-tooltip v-if="formCalificacion.puntuacion < 1">
              Selecciona al menos una estrella.
            </q-tooltip>
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-banner v-if="message" class="bg-green-1 text-positive q-mt-md rounded-borders">
      {{ message }}
    </q-banner>

    <q-banner v-if="errorMessage" class="bg-red-1 text-negative q-mt-md rounded-borders">
      {{ errorMessage }}
    </q-banner>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { obtenerMovimientosPorUsuario } from 'src/services/movimientos.service'
import { obtenerHistorialP2P } from 'src/services/ofertas.service'
import { calificarOperacion } from 'src/services/calificaciones.service'

const tab = ref('movimientos')
const usuarioId = Number(localStorage.getItem('userId'))

const movimientos = ref([])
const operacionesP2P = ref([])

const loadingMovimientos = ref(false)
const loadingP2P = ref(false)

const errorMessage = ref('')
const message = ref('')

const dialogVoucher = ref(false)
const voucherSeleccionado = ref('')
const voucherError = ref(false)

const dialogCalificacion = ref(false)
const guardandoCalificacion = ref(false)
const operacionSeleccionada = ref(null)
const errorCalificacion = ref('')

const formCalificacion = ref({
  puntuacion: 0,
  comentario: '',
})

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
  { name: 'creadorNombre', label: 'Ofertante', field: 'creadorNombre', align: 'left' },
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
  { name: 'calificacion', label: 'Calificación', field: 'calificacion', align: 'center' },
]

const textoPuntuacion = computed(() => {
  const textos = {
    0: 'Selecciona una puntuación',
    1: 'Muy mala experiencia',
    2: 'Mala experiencia',
    3: 'Experiencia regular',
    4: 'Buena experiencia',
    5: 'Excelente experiencia',
  }

  return textos[formCalificacion.value.puntuacion] || ''
})

const cargarMovimientos = async () => {
  try {
    loadingMovimientos.value = true
    errorMessage.value = ''
    movimientos.value = await obtenerMovimientosPorUsuario(usuarioId)
  } catch (error) {
    console.error(error)
    errorMessage.value = error.response?.data?.message || 'No se pudieron cargar los movimientos.'
  } finally {
    loadingMovimientos.value = false
  }
}

const cargarHistorialP2P = async () => {
  try {
    loadingP2P.value = true
    errorMessage.value = ''
    operacionesP2P.value = await obtenerHistorialP2P(usuarioId)
  } catch (error) {
    console.error(error)
    errorMessage.value = error.response?.data?.message || 'No se pudo cargar el historial P2P.'
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
  if (estado === 'DISPONIBLE') return 'primary'
  return 'orange'
}

const formatearFecha = (fecha) => {
  if (!fecha) return '-'

  return new Date(fecha).toLocaleString('es-PE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const verVoucher = (movimiento) => {
  voucherError.value = false
  const ruta = movimiento.rutaVoucher

  if (!ruta) {
    voucherSeleccionado.value = ''
    voucherError.value = true
    dialogVoucher.value = true
    return
  }

  voucherSeleccionado.value = ruta.startsWith('http') ? ruta : `${apiBaseUrl}${ruta}`

  dialogVoucher.value = true
}

const abrirCalificacion = (operacion) => {
  operacionSeleccionada.value = operacion
  formCalificacion.value = {
    puntuacion: 0,
    comentario: '',
  }
  errorCalificacion.value = ''
  message.value = ''
  dialogCalificacion.value = true
}

const cerrarCalificacion = () => {
  if (guardandoCalificacion.value) return

  dialogCalificacion.value = false
  operacionSeleccionada.value = null
  errorCalificacion.value = ''
}

const guardarCalificacion = async () => {
  if (!operacionSeleccionada.value) return

  if (formCalificacion.value.puntuacion < 1) {
    errorCalificacion.value = 'Selecciona entre 1 y 5 estrellas.'
    return
  }

  try {
    guardandoCalificacion.value = true
    errorCalificacion.value = ''

    const response = await calificarOperacion({
      ofertaId: Number(operacionSeleccionada.value.id),
      usuarioEvaluadorId: usuarioId,
      puntuacion: Number(formCalificacion.value.puntuacion),
      comentario: formCalificacion.value.comentario.trim() || null,
    })

    message.value = response.message || 'Calificación registrada correctamente.'
    dialogCalificacion.value = false
    operacionSeleccionada.value = null

    await cargarHistorialP2P()
  } catch (error) {
    console.error(error)
    errorCalificacion.value =
      error.response?.data?.message ||
      error.response?.data?.title ||
      'No se pudo registrar la calificación.'
  } finally {
    guardandoCalificacion.value = false
  }
}

onMounted(() => {
  cargarMovimientos()
  cargarHistorialP2P()
})
</script>

<style scoped>
.historial-page {
  min-height: 100%;
  background-color: #090c16;
}

.historial-panels {
  background-color: transparent;
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

.historial-table .q-badge,
.historial-table .q-chip {
  font-weight: 600;
}

.historial-dialog-card,
.calificacion-card {
  background-color: #121826;
  color: #e5e8ee;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.voucher-image {
  width: 100%;
  max-height: 75vh;
  object-fit: contain;
  border-radius: 12px;
}

.calificacion-card {
  width: 480px;
  max-width: 95vw;
  border-radius: 18px;
}
</style>
