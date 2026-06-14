<template>
  <q-page class="q-pa-lg">
    <div class="row justify-between items-center q-mb-sm">
      <div>
        <div class="text-h4 text-primary">Mis billeteras</div>
        <div class="text-grey-7">Consulta tus saldos disponibles y bloqueados por moneda.</div>
      </div>

      <div>
        <q-btn
          color="primary"
          icon="add"
          label="Crear billetera"
          @click="abrirModalCrear"
          :disable="monedasDisponibles.length === 0"
        />

        <q-tooltip
          v-if="monedasDisponibles.length === 0"
          anchor="center left"
          self="center right"
          class="text-subtitle2"
        >
          Todas las billeteras fueron creadas
        </q-tooltip>
      </div>
    </div>
    <q-spinner v-if="loading" color="primary" size="40px" />

    <div v-else class="row q-col-gutter-md q-mt-md">
      <div
        v-for="billetera in billeteras"
        :key="billetera.monedaCodigo"
        class="col-12 col-sm-6 col-md-4"
      >
        <q-card class="q-pa-md wallet-card">
          <div class="row items-center justify-between">
            <div>
              <div class="text-h6">
                {{ billetera.monedaCodigo }}
              </div>

              <div class="text-grey-7">
                {{ billetera.monedaNombre }}
              </div>
            </div>

            <div class="row items-center q-gutter-sm">
              <q-avatar size="44px">
                <img :src="billetera.monedaBandera" />
              </q-avatar>

              <q-chip color="primary" text-color="white">
                {{ billetera.monedaSimbolo }}
              </q-chip>
            </div>
          </div>

          <q-separator class="q-my-md" />

          <div class="text-grey-7">Saldo disponible</div>

          <div class="text-h5 text-teal-7 q-mb-md">
            {{ billetera.monedaSimbolo }} {{ billetera.saldoDisponible.toFixed(2) }}
          </div>

          <div v-if="billetera.saldoBloqueado > 0">
            <div class="text-grey-7">Saldo bloqueado</div>

            <div class="text-orange-8 text-h6">
              {{ billetera.monedaSimbolo }}
              {{ billetera.saldoBloqueado.toFixed(2) }}
            </div>
          </div>

          <div class="row q-gutter-sm q-mt-md">
            <q-btn color="primary" icon="add" label="Recargar" size="sm" />
            <q-btn outline color="negative" icon="remove" label="Retirar" size="sm" />
          </div>
        </q-card>
      </div>
    </div>

    <q-banner
      v-if="!loading && billeteras.length === 0"
      class="bg-grey-2 text-grey-8 q-mt-md rounded-borders"
    >
      No tienes billeteras registradas. Crea una billetera para empezar a operar.
    </q-banner>

    <q-dialog v-model="modalCrear">
      <q-card style="width: 420px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">Crear billetera</div>
          <div class="text-grey-7">Selecciona la moneda que deseas agregar.</div>
        </q-card-section>

        <q-card-section>
          <q-select
            outlined
            v-model="monedaSeleccionada"
            :options="monedasDisponibles"
            option-label="label"
            option-value="id"
            label="Moneda"
            emit-value
            map-options
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />

          <q-btn color="primary" label="Crear" :loading="creating" @click="crearNuevaBilletera" />
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
import { obtenerSaldosPorUsuario, crearBilletera } from 'src/services/billeteras.service'
import { obtenerMonedasActivas } from 'src/services/monedas.service'

const billeteras = ref([])
const monedas = ref([])
const loading = ref(false)
const creating = ref(false)
const modalCrear = ref(false)
const monedaSeleccionada = ref(null)
const message = ref('')
const errorMessage = ref('')

const usuarioId = localStorage.getItem('userId')

const monedasDisponibles = computed(() => {
  const codigosBilleteras = billeteras.value.map((b) => b.monedaCodigo)

  return monedas.value
    .filter((m) => !codigosBilleteras.includes(m.codigoIso))
    .map((m) => ({
      id: m.id,
      label: `${m.codigoIso} - ${m.nombre}`,
    }))
})

const cargarBilleteras = async () => {
  try {
    loading.value = true
    billeteras.value = await obtenerSaldosPorUsuario(usuarioId)
  } catch (error) {
    console.error(error)
    errorMessage.value = 'No se pudieron cargar las billeteras.'
  } finally {
    loading.value = false
  }
}

const cargarMonedas = async () => {
  try {
    monedas.value = await obtenerMonedasActivas()
  } catch (error) {
    console.error(error)
    errorMessage.value = 'No se pudieron cargar las monedas.'
  }
}

const abrirModalCrear = async () => {
  message.value = ''
  errorMessage.value = ''
  monedaSeleccionada.value = null

  await cargarMonedas()
  modalCrear.value = true
}

const crearNuevaBilletera = async () => {
  message.value = ''
  errorMessage.value = ''

  if (!monedaSeleccionada.value) {
    errorMessage.value = 'Selecciona una moneda.'
    return
  }

  try {
    creating.value = true

    const response = await crearBilletera({
      usuarioId: Number(usuarioId),
      monedaId: monedaSeleccionada.value,
      monto: 0,
    })

    message.value = response.message || 'Billetera creada correctamente.'
    modalCrear.value = false

    await cargarBilleteras()
  } catch (error) {
    errorMessage.value =
      error.response?.data?.message || error.response?.data || 'No se pudo crear la billetera.'
  } finally {
    creating.value = false
  }
}

onMounted(() => {
  cargarBilleteras()
})
</script>

<style scoped>
.wallet-card {
  border-radius: 16px;
}
</style>
