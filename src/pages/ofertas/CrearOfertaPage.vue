<template>
  <q-page class="q-pa-lg">
    <div class="text-h4 text-primary q-mb-sm">Crear oferta</div>

    <div class="text-grey-7 q-mb-lg">Crea una oferta directa entre billeteras del sistema.</div>

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
        class="q-mb-sm"
        @update:model-value="alCambiarMonedas"
      />

      <div v-if="monedaOrigen" class="text-grey-7 q-mb-md">
        Saldo disponible:
        <strong>
          {{ monedaOrigen.monedaSimbolo }}
          {{ saldoDisponibleOrigen.toFixed(2) }}
          {{ monedaOrigen.monedaCodigo }}
        </strong>
      </div>

      <q-input
        outlined
        v-model.number="form.montoOrigen"
        label="Monto a ofrecer"
        type="number"
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
        @update:model-value="alCambiarMonedas"
      />

      <div v-if="referenciaTipoCambio" class="text-primary q-mb-sm">
        Ref: 1 {{ monedaOrigen?.monedaCodigo }} =
        {{ referenciaTipoCambio }}
        {{ monedaDestino?.monedaCodigo }}
      </div>

      <q-input
        outlined
        v-model.number="form.tasaCambio"
        label="Tipo de cambio"
        type="number"
        class="q-mb-md"
      />

      <q-banner class="bg-grey-2 text-grey-8 q-mb-md rounded-borders">
        Monto a recibir:
        <strong>
          {{ monedaDestino?.monedaSimbolo || '' }}
          {{ montoARecibir.toFixed(2) }}
          {{ monedaDestino?.monedaCodigo || '' }}
        </strong>
      </q-banner>

      <q-banner class="bg-blue-1 text-primary q-mb-md rounded-borders">
        Al publicar la oferta, el monto ofrecido será bloqueado temporalmente en tu billetera.
      </q-banner>

      <q-btn
        color="primary"
        label="Publicar oferta"
        class="full-width"
        :loading="loading"
        :disable="!formularioValido"
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
import { obtenerSaldosPorUsuario } from 'src/services/billeteras.service'
import { obtenerTipoCambioEnVivo } from 'src/services/tipoCambio.service'

const monedas = ref([])
const billeteras = ref([])
const loading = ref(false)
const message = ref('')
const errorMessage = ref('')
const referenciaTipoCambio = ref(null)

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

const monedaOrigen = computed(() =>
  billeteras.value.find((b) => b.monedaId === form.value.monedaOrigenId),
)

const monedaDestino = computed(() =>
  billeteras.value.find((b) => b.monedaId === form.value.monedaDestinoId),
)

const saldoDisponibleOrigen = computed(() => monedaOrigen.value?.saldoDisponible || 0)

const montoARecibir = computed(() => {
  const monto = Number(form.value.montoOrigen) || 0
  const tasa = Number(form.value.tasaCambio) || 0
  return monto * tasa
})

const formularioValido = computed(() => {
  return (
    form.value.monedaOrigenId &&
    form.value.monedaDestinoId &&
    form.value.monedaOrigenId !== form.value.monedaDestinoId &&
    form.value.montoOrigen > 0 &&
    form.value.tasaCambio > 0 &&
    form.value.montoOrigen <= saldoDisponibleOrigen.value
  )
})

const cargarDatos = async () => {
  monedas.value = await obtenerMonedasActivas()
  billeteras.value = await obtenerSaldosPorUsuario(usuarioId)
}

const extraerTasa = (data) => {
  return (
    data?.tasaCambio ||
    data?.tipoCambio ||
    data?.rate ||
    data?.conversion_rate ||
    data?.resultado ||
    null
  )
}

const alCambiarMonedas = async () => {
  referenciaTipoCambio.value = null

  if (!monedaOrigen.value || !monedaDestino.value) return

  try {
    const response = await obtenerTipoCambioEnVivo(
      monedaOrigen.value.monedaCodigo,
      monedaDestino.value.monedaCodigo,
    )

    const tasa = extraerTasa(response)

    if (tasa) {
      referenciaTipoCambio.value = Number(tasa).toFixed(4)

      if (!form.value.tasaCambio) {
        form.value.tasaCambio = Number(tasa)
      }
    }
  } catch (error) {
    console.error(error)
  }
}

const guardarOferta = async () => {
  message.value = ''
  errorMessage.value = ''

  if (!formularioValido.value) {
    errorMessage.value = 'Completa correctamente los datos de la oferta.'
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

    referenciaTipoCambio.value = null
    await cargarDatos()
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'No se pudo publicar la oferta.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  cargarDatos()
})
</script>

<style scoped>
.oferta-form {
  max-width: 560px;
  border-radius: 16px;
}
</style>
