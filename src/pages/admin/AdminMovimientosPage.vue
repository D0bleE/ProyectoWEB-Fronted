<template>
  <q-page class="q-pa-lg">
    <div class="text-h4 text-primary q-mb-sm">Administración de movimientos</div>

    <div class="text-grey-7 q-mb-lg">
      Aprueba o rechaza solicitudes de recarga y retiro pendientes.
    </div>

    <q-spinner v-if="loading" color="primary" size="40px" />

    <q-table
      v-else
      title="Solicitudes pendientes"
      :rows="movimientos"
      :columns="columns"
      row-key="id"
      flat
      bordered
    >
      <template #body-cell-rutaVoucher="props">
        <q-td :props="props">
          <q-btn
            v-if="props.row.rutaVoucher"
            flat
            color="primary"
            icon="image"
            label="Ver voucher"
            @click="verVoucher(props.row.rutaVoucher)"
          />
          <span v-else class="text-grey">No aplica</span>
        </q-td>
      </template>

      <template #body-cell-acciones="props">
        <q-td :props="props">
          <q-btn
            dense
            color="positive"
            icon="check"
            label="Aprobar"
            class="q-mr-sm"
            :loading="processingId === props.row.id"
            @click="procesar(props.row.id, 'ACEPTAR')"
          />

          <q-btn
            dense
            outline
            color="negative"
            icon="close"
            label="Rechazar"
            :loading="processingId === props.row.id"
            @click="procesar(props.row.id, 'RECHAZAR')"
          />
        </q-td>
      </template>
    </q-table>

    <q-banner
      v-if="!loading && movimientos.length === 0"
      class="bg-info-dark text-info q-mt-md rounded-borders"
    >
      No hay solicitudes pendientes.
    </q-banner>

    <q-dialog v-model="modalVoucher">
      <q-card style="width: 600px; max-width: 95vw">
        <q-card-section>
          <div class="text-h6">Voucher</div>
        </q-card-section>

        <q-card-section>
          <img :src="voucherUrl" style="width: 100%; border-radius: 12px" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cerrar" color="primary" v-close-popup />
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
import { onMounted, ref } from 'vue'
import { obtenerSolicitudesPendientes, procesarSolicitud } from 'src/services/movimientos.service'

const movimientos = ref([])
const loading = ref(false)
const processingId = ref(null)
const message = ref('')
const errorMessage = ref('')
const modalVoucher = ref(false)
const voucherUrl = ref('')

const apiBaseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || ''

const columns = [
  {
    name: 'usuarioNombre',
    label: 'Usuario',
    field: 'usuarioNombre',
    align: 'left',
  },
  {
    name: 'tipoMovimiento',
    label: 'Tipo',
    field: 'tipoMovimiento',
    align: 'left',
  },
  {
    name: 'monedaCodigo',
    label: 'Moneda',
    field: 'monedaCodigo',
    align: 'left',
  },
  {
    name: 'monto',
    label: 'Monto',
    field: 'monto',
    align: 'right',
    format: (val) => Number(val).toFixed(2),
  },
  {
    name: 'rutaVoucher',
    label: 'Voucher',
    field: 'rutaVoucher',
    align: 'center',
  },
  {
    name: 'acciones',
    label: 'Acciones',
    field: 'acciones',
    align: 'center',
  },
]

const cargarMovimientos = async () => {
  try {
    loading.value = true
    movimientos.value = await obtenerSolicitudesPendientes()
  } catch (error) {
    console.error(error)
    errorMessage.value = 'No se pudieron cargar las solicitudes pendientes.'
  } finally {
    loading.value = false
  }
}

const verVoucher = (ruta) => {
  voucherUrl.value = `${apiBaseUrl}${ruta}`
  modalVoucher.value = true
}

const procesar = async (id, accion) => {
  try {
    message.value = ''
    errorMessage.value = ''
    processingId.value = id

    const response = await procesarSolicitud(id, accion)

    message.value = response.message || 'Solicitud procesada correctamente.'

    await cargarMovimientos()
  } catch (error) {
    console.error(error)
    errorMessage.value = error.response?.data?.message || 'No se pudo procesar la solicitud.'
  } finally {
    processingId.value = null
  }
}

onMounted(() => {
  cargarMovimientos()
})
</script>
