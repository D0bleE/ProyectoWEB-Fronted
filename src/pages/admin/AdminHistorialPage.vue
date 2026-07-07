<template>
  <q-page class="q-pa-lg">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-primary">Historial Admin</div>
        <div class="text-grey-7">
          Consulta todos los movimientos de recarga y retiro realizados por los usuarios.
        </div>
      </div>

      <q-btn
        outline
        color="primary"
        icon="refresh"
        label="Actualizar"
        :loading="loading"
        @click="cargarHistorial"
      />
    </div>

    <div class="row q-col-gutter-md q-mb-md">
      <div class="col-12 col-sm-6 col-md">
        <q-input outlined dense v-model="buscar" placeholder="Buscar usuario o correo...">
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </div>

      <div class="col-12 col-sm-6 col-md">
        <q-select
          outlined
          dense
          v-model="filtroEstado"
          :options="estadoOptions"
          label="Estado"
          emit-value
          map-options
        />
      </div>

      <div class="col-12 col-sm-6 col-md">
        <q-select
          outlined
          dense
          v-model="filtroTipo"
          :options="tipoOptions"
          label="Tipo"
          emit-value
          map-options
        />
      </div>
    </div>

    <q-table
      flat
      bordered
      :rows="movimientosFiltrados"
      :columns="columns"
      row-key="id"
      :loading="loading"
      :pagination="{ rowsPerPage: 10 }"
      no-data-label="No hay movimientos registrados."
    >
      <template #body-cell-usuario="props">
        <q-td :props="props">
          <div class="text-weight-medium">{{ props.row.usuarioNombre }}</div>
          <div class="text-caption text-grey-7">{{ props.row.usuarioEmail }}</div>
        </q-td>
      </template>

      <template #body-cell-tipoMovimiento="props">
        <q-td :props="props">
          <q-chip
            :color="props.row.tipoMovimiento === 'RECARGA' ? 'positive' : 'negative'"
            text-color="white"
            dense
          >
            {{ props.row.tipoMovimiento }}
          </q-chip>
        </q-td>
      </template>

      <template #body-cell-monto="props">
        <q-td :props="props">
          <strong>
            {{ props.row.monedaSimbolo }}
            {{ Number(props.row.monto).toFixed(2) }}
            {{ props.row.monedaCodigo }}
          </strong>
        </q-td>
      </template>

      <template #body-cell-estado="props">
        <q-td :props="props">
          <q-chip :color="colorEstado(props.row.estado)" text-color="white" dense>
            {{ props.row.estado }}
          </q-chip>
        </q-td>
      </template>

      <template #body-cell-fechaSolicitud="props">
        <q-td :props="props">
          {{ formatearFecha(props.row.fechaSolicitud) }}
        </q-td>
      </template>

      <template #body-cell-fechaProcesado="props">
        <q-td :props="props">
          {{ formatearFecha(props.row.fechaProcesado) }}
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
            @click="verVoucher(props.row.rutaVoucher)"
          />
          <span v-else class="text-grey">-</span>
        </q-td>
      </template>
    </q-table>

    <q-dialog v-model="dialogVoucher">
      <q-card style="width: 650px; max-width: 95vw">
        <q-card-section class="row items-center">
          <div class="text-h6">Voucher</div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section>
          <img
            :src="voucherUrl"
            style="width: 100%; border-radius: 12px"
            @error="voucherError = true"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <q-banner v-if="voucherError" class="bg-red-1 text-negative q-mt-md rounded-borders">
      No se encontró el archivo del voucher.
    </q-banner>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { obtenerHistorialMovimientosAdmin } from 'src/services/movimientos.service'

const apiBaseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || ''

const movimientos = ref([])
const loading = ref(false)
const errorMessage = ref('')

const buscar = ref('')
const filtroEstado = ref('TODOS')
const filtroTipo = ref('TODOS')

const dialogVoucher = ref(false)
const voucherUrl = ref('')

const estadoOptions = [
  { label: 'Todos', value: 'TODOS' },
  { label: 'Pendiente', value: 'PENDIENTE' },
  { label: 'Aprobado', value: 'APROBADO' },
  { label: 'Rechazado', value: 'RECHAZADO' },
]

const tipoOptions = [
  { label: 'Todos', value: 'TODOS' },
  { label: 'Recarga', value: 'RECARGA' },
  { label: 'Retiro', value: 'RETIRO' },
]

const columns = [
  { name: 'usuario', label: 'Usuario', field: 'usuarioNombre', align: 'left' },
  { name: 'tipoMovimiento', label: 'Tipo', field: 'tipoMovimiento', align: 'center' },
  { name: 'monedaCodigo', label: 'Moneda', field: 'monedaCodigo', align: 'center' },
  { name: 'monto', label: 'Monto', field: 'monto', align: 'right' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'fechaSolicitud', label: 'Fecha solicitud', field: 'fechaSolicitud', align: 'center' },
  { name: 'fechaProcesado', label: 'Fecha procesado', field: 'fechaProcesado', align: 'center' },
  { name: 'rutaVoucher', label: 'Voucher', field: 'rutaVoucher', align: 'center' },
]

const movimientosFiltrados = computed(() => {
  const texto = buscar.value.toLowerCase()

  return movimientos.value.filter((m) => {
    const coincideBusqueda =
      m.usuarioNombre?.toLowerCase().includes(texto) ||
      m.usuarioEmail?.toLowerCase().includes(texto)

    const coincideEstado = filtroEstado.value === 'TODOS' || m.estado === filtroEstado.value

    const coincideTipo = filtroTipo.value === 'TODOS' || m.tipoMovimiento === filtroTipo.value

    return coincideBusqueda && coincideEstado && coincideTipo
  })
})

const cargarHistorial = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    movimientos.value = await obtenerHistorialMovimientosAdmin()
  } catch (error) {
    console.error(error)
    errorMessage.value = 'No se pudo cargar el historial administrativo.'
  } finally {
    loading.value = false
  }
}

const colorEstado = (estado) => {
  if (estado === 'APROBADO') return 'positive'
  if (estado === 'RECHAZADO') return 'negative'
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

const voucherError = ref(false)

const verVoucher = (ruta) => {
  voucherError.value = false
  voucherUrl.value = `${apiBaseUrl}${ruta}`
  dialogVoucher.value = true
}

onMounted(() => {
  cargarHistorial()
})
</script>
