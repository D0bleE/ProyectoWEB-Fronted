<template>
  <q-page class="q-pa-lg">
    <div class="text-h4 text-primary q-mb-sm">Crear oferta</div>

    <div class="text-grey-7 q-mb-lg">
      Publica una oferta de compra o venta de divisas en el mercado P2P.
    </div>

    <q-card class="q-pa-lg oferta-form">
      <q-select
        outlined
        v-model="form.monedaOrigenId"
        :options="monedasOptions"
        option-label="label"
        option-value="id"
        emit-value
        map-options
        label="Moneda que ofreces"
        class="q-mb-md"
      />

      <q-select
        outlined
        v-model="form.monedaDestinoId"
        :options="monedasOptions"
        option-label="label"
        option-value="id"
        emit-value
        map-options
        label="Moneda que deseas recibir"
        class="q-mb-md"
      />

      <q-input
        outlined
        v-model.number="form.montoOrigen"
        label="Monto a ofrecer"
        type="number"
        class="q-mb-md"
      />

      <q-input
        outlined
        v-model.number="form.tasaCambio"
        label="Tipo de cambio"
        type="number"
        class="q-mb-md"
      />

      <q-btn
        color="primary"
        label="Publicar oferta"
        class="full-width"
        :loading="loading"
        @click="guardarOferta"
      />
    </q-card>

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
import { crearOferta } from 'src/services/ofertas.service'
import { obtenerMonedasActivas } from 'src/services/monedas.service'

const monedas = ref([])
const loading = ref(false)
const message = ref('')
const errorMessage = ref('')

const usuarioId = localStorage.getItem('userId')

const form = ref({
  monedaOrigenId: null,
  monedaDestinoId: null,
  montoOrigen: null,
  tasaCambio: null,
})

const monedasOptions = computed(() =>
  monedas.value.map((m) => ({
    id: m.id,
    label: `${m.codigoIso} - ${m.nombre}`,
  })),
)

const cargarMonedas = async () => {
  monedas.value = await obtenerMonedasActivas()
}

const guardarOferta = async () => {
  message.value = ''
  errorMessage.value = ''

  if (!form.value.monedaOrigenId || !form.value.monedaDestinoId) {
    errorMessage.value = 'Selecciona las monedas de la oferta.'
    return
  }

  if (form.value.monedaOrigenId === form.value.monedaDestinoId) {
    errorMessage.value = 'La moneda de origen y destino no pueden ser iguales.'
    return
  }

  if (!form.value.montoOrigen || form.value.montoOrigen <= 0) {
    errorMessage.value = 'El monto debe ser mayor a cero.'
    return
  }

  if (!form.value.tasaCambio || form.value.tasaCambio <= 0) {
    errorMessage.value = 'El tipo de cambio debe ser mayor a cero.'
    return
  }

  try {
    loading.value = true

    const response = await crearOferta({
      usuarioId: Number(usuarioId),
      monedaOrigenId: Number(form.value.monedaOrigenId),
      monedaDestinoId: Number(form.value.monedaDestinoId),
      montoOrigen: Number(form.value.montoOrigen),
      tasaCambio: Number(form.value.tasaCambio),
    })

    message.value = response.message || 'Oferta publicada correctamente.'

    form.value = {
      monedaOrigenId: null,
      monedaDestinoId: null,
      montoOrigen: null,
      tasaCambio: null,
    }
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || 'No se pudo publicar la oferta.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  cargarMonedas()
})
</script>

<style scoped>
.oferta-form {
  max-width: 520px;
  border-radius: 16px;
}
</style>