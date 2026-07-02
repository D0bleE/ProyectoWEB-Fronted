<template>
  <q-page class="q-pa-lg">
    <div class="text-h4 text-primary q-mb-sm">Historial de movimientos</div>

    <div class="text-grey-7 q-mb-lg">Consulta todas tus solicitudes de recarga y retiro.</div>

    <q-spinner v-if="loading" color="primary" size="40px" />

    <q-table
      v-else
      flat
      bordered
      :rows="movimientos"
      :columns="columns"
      row-key="id"
      :pagination="{ rowsPerPage: 10 }"
      no-data-label="No existen movimientos registrados."
    >
      <template v-slot:body-cell-tipoMovimiento="props">
        <q-td :props="props">
          <q-badge :color="props.row.tipoMovimiento === 'RECARGA' ? 'primary' : 'negative'">
            {{ props.row.tipoMovimiento }}
          </q-badge>
        </q-td>
      </template>

      <template v-slot:body-cell-monto="props">
        <q-td :props="props">
          {{ props.row.monedaSimbolo }}
          {{ Number(props.row.monto).toFixed(2) }}
        </q-td>
      </template>

      <template v-slot:body-cell-estado="props">
        <q-td :props="props">
          <q-chip v-if="props.row.estado === 'PENDIENTE'" color="orange" text-color="white">
            Pendiente
          </q-chip>

          <q-chip v-else-if="props.row.estado === 'APROBADO'" color="positive" text-color="white">
            Aprobado
          </q-chip>

          <q-chip v-else color="negative" text-color="white"> Rechazado </q-chip>
        </q-td>
      </template>

      <template v-slot:body-cell-rutaVoucher="props">
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
    </q-table>

    <q-dialog v-model="dialogVoucher">
      <q-card style="min-width: 650px">
        <q-card-section class="row items-center">
          <div class="text-h6">Voucher</div>

          <q-space />

          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section>
          <img :src="voucherSeleccionado" style="width: 100%" />
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { obtenerMovimientosPorUsuario } from 'src/services/movimientos.service'

const usuarioId = localStorage.getItem('userId')

const loading = ref(false)

const movimientos = ref([])

const dialogVoucher = ref(false)

const voucherSeleccionado = ref('')

const columns = [
  {
    name: 'tipoMovimiento',
    label: 'Movimiento',
    field: 'tipoMovimiento',
    align: 'center',
  },

  {
    name: 'monedaCodigo',
    label: 'Moneda',
    field: 'monedaCodigo',
    align: 'center',
  },

  {
    name: 'monto',
    label: 'Monto',
    field: 'monto',
    align: 'right',
  },

  {
    name: 'estado',
    label: 'Estado',
    field: 'estado',
    align: 'center',
  },

  {
    name: 'fechaSolicitud',
    label: 'Fecha solicitud',
    field: 'fechaSolicitud',
    align: 'center',
  },

  {
    name: 'fechaProcesado',
    label: 'Fecha procesado',
    field: 'fechaProcesado',
    align: 'center',
  },

  {
    name: 'rutaVoucher',
    label: 'Voucher',
    field: 'rutaVoucher',
    align: 'center',
  },
]

const cargarMovimientos = async () => {
  loading.value = true

  try {
    movimientos.value = await obtenerMovimientosPorUsuario(usuarioId)
  } finally {
    loading.value = false
  }
}

const verVoucher = (movimiento) => {
  voucherSeleccionado.value = `https://localhost:7120${movimiento.rutaVoucher}`

  dialogVoucher.value = true
}

onMounted(cargarMovimientos)
</script>
