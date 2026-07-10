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
      >
        <template #option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section avatar>
              <q-avatar size="32px">
                <img :src="scope.opt.bandera" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label> {{ scope.opt.codigo }} - {{ scope.opt.nombre }} </q-item-label>
              <q-item-label caption>
                Saldo disponible:
                <span class="text-teal-7 text-weight-bold">
                  {{ scope.opt.simbolo }} {{ scope.opt.saldo.toFixed(2) }}
                </span>
              </q-item-label>
            </q-item-section>
          </q-item>
        </template>

        <template #selected-item="scope">
          <div class="row items-center q-gutter-sm">
            <q-avatar size="24px">
              <img :src="scope.opt.bandera" />
            </q-avatar>
            <span>{{ scope.opt.codigo }} - {{ scope.opt.nombre }}</span>
          </div>
        </template>
      </q-select>

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
        class="q-mb-sm"
      />

      <q-banner
        v-if="montoSuperaSaldo"
        class="bg-negative-dark text-negative q-mb-md rounded-borders"
      >
        El monto ingresado supera tu saldo disponible.
      </q-banner>

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
      >
        <template #option="scope">
          <q-item v-bind="scope.itemProps">
            <q-item-section avatar>
              <q-avatar size="32px">
                <img :src="scope.opt.bandera" />
              </q-avatar>
            </q-item-section>

            <q-item-section>
              <q-item-label> {{ scope.opt.codigo }} - {{ scope.opt.nombre }} </q-item-label>
              <q-item-label caption>
                Saldo actual:
                <span class="text-grey-8 text-weight-bold">
                  {{ scope.opt.simbolo }} {{ scope.opt.saldo.toFixed(2) }}
                </span>
              </q-item-label>
            </q-item-section>
          </q-item>
        </template>

        <template #selected-item="scope">
          <div class="row items-center q-gutter-sm">
            <q-avatar size="24px">
              <img :src="scope.opt.bandera" />
            </q-avatar>
            <span>{{ scope.opt.codigo }} - {{ scope.opt.nombre }}</span>
          </div>
        </template>
      </q-select>

      <q-banner
        v-if="referenciaMensaje"
        class="bg-warning-dark text-warning q-mb-md rounded-borders"
      >
        Referencia actual: {{ referenciaMensaje }}
      </q-banner>

      <q-input
        outlined
        v-model.number="form.tasaCambio"
        label="Tipo de cambio"
        type="number"
        class="q-mb-md"
      />

      <q-banner class="bg-info-dark text-info q-mb-md rounded-borders">
        Monto a recibir:
        <strong>
          {{ monedaDestino?.monedaSimbolo || '' }}
          {{ montoARecibir.toFixed(2) }}
          {{ monedaDestino?.monedaCodigo || '' }}
        </strong>
      </q-banner>

      <q-banner class="bg-primary-dark text-primary q-mb-md rounded-borders">
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

    <q-banner v-if="message" class="bg-positive-dark text-positive q-mt-md rounded-borders">
      {{ message }}
    </q-banner>

    <q-banner v-if="errorMessage" class="bg-negative-dark text-negative q-mt-md rounded-borders">
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
const referenciaMensaje = ref('')

const usuarioId = localStorage.getItem('userId')

const form = ref({
  monedaOrigenId: null,
  monedaDestinoId: null,
  montoOrigen: null,
  tasaCambio: null,
})

const monedasOptions = computed(() =>
  billeteras.value.map((b) => ({
    id: b.monedaId,
    codigo: b.monedaCodigo,
    nombre: b.monedaNombre,
    simbolo: b.monedaSimbolo,
    bandera: b.monedaBandera,
    saldo: Number(b.saldoDisponible),
    label: `${b.monedaCodigo} - ${b.monedaNombre}`,
  })),
)

const monedaOrigen = computed(() =>
  billeteras.value.find((b) => b.monedaId === form.value.monedaOrigenId),
)

const monedaDestino = computed(() =>
  billeteras.value.find((b) => b.monedaId === form.value.monedaDestinoId),
)

const saldoDisponibleOrigen = computed(() => Number(monedaOrigen.value?.saldoDisponible || 0))

const montoARecibir = computed(() => {
  const monto = Number(form.value.montoOrigen) || 0
  const tasa = Number(form.value.tasaCambio) || 0
  return monto * tasa
})

const montoSuperaSaldo = computed(() => {
  return Number(form.value.montoOrigen) > saldoDisponibleOrigen.value
})

const formularioValido = computed(() => {
  return (
    form.value.monedaOrigenId &&
    form.value.monedaDestinoId &&
    form.value.monedaOrigenId !== form.value.monedaDestinoId &&
    Number(form.value.montoOrigen) > 0 &&
    Number(form.value.tasaCambio) > 0 &&
    !montoSuperaSaldo.value
  )
})

const cargarDatos = async () => {
  monedas.value = await obtenerMonedasActivas()
  billeteras.value = await obtenerSaldosPorUsuario(usuarioId)
}

const alCambiarMonedas = async () => {
  referenciaMensaje.value = ''

  if (!monedaOrigen.value || !monedaDestino.value) return

  if (form.value.monedaOrigenId === form.value.monedaDestinoId) return

  try {
    const response = await obtenerTipoCambioEnVivo(
      monedaOrigen.value.monedaCodigo,
      monedaDestino.value.monedaCodigo,
    )

    if (response?.mensaje) {
      referenciaMensaje.value = response.mensaje
    }

    if (response?.tasaCambioReferencial && !form.value.tasaCambio) {
      form.value.tasaCambio = Number(response.tasaCambioReferencial)
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

    referenciaMensaje.value = ''
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
