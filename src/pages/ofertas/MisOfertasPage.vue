<template>
  <q-page class="q-pa-lg">
    <div class="text-h4 text-primary q-mb-sm">Mis ofertas</div>

    <div class="text-grey-7 q-mb-lg">Consulta y cancela tus ofertas activas.</div>

    <q-spinner v-if="loading" color="primary" size="40px" />

    <div v-else class="row q-col-gutter-md">
      <div v-for="oferta in misOfertas" :key="oferta.id" class="col-12 col-md-4">
        <q-card class="q-pa-md oferta-card">
          <div class="text-h6">
            {{ oferta.monedaOrigenCodigo }} → {{ oferta.monedaDestinoCodigo }}
          </div>

          <div class="text-grey-7 q-mb-md">Estado: DISPONIBLE</div>

          <div class="text-caption text-grey-7">Ofreces</div>
          <div class="text-h6 text-primary">
            {{ oferta.monedaOrigenSimbolo }}
            {{ oferta.montoOfrecido.toFixed(2) }}
            {{ oferta.monedaOrigenCodigo }}
          </div>

          <div class="text-caption text-grey-7 q-mt-md">Recibes</div>
          <div class="text-h6 text-teal-7">
            {{ oferta.monedaDestinoSimbolo }}
            {{ oferta.montoARecibir.toFixed(2) }}
            {{ oferta.monedaDestinoCodigo }}
          </div>

          <q-separator class="q-my-md" />

          <div class="text-grey-8">Tipo de cambio: {{ oferta.tasaCambio }}</div>

          <q-btn
            outline
            color="negative"
            label="Cancelar oferta"
            class="full-width q-mt-md"
            :loading="processingId === oferta.id"
            @click="cancelar(oferta.id)"
          />
        </q-card>
      </div>
    </div>

    <q-banner
      v-if="!loading && misOfertas.length === 0"
      class="bg-grey-2 text-grey-8 q-mt-md rounded-borders"
    >
      No tienes ofertas activas.
    </q-banner>

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
import { obtenerMercado, cancelarOferta } from 'src/services/ofertas.service'

const ofertas = ref([])
const loading = ref(false)
const processingId = ref(null)
const message = ref('')
const errorMessage = ref('')

const usuarioId = Number(localStorage.getItem('userId'))

const misOfertas = computed(() => {
  return ofertas.value.filter((oferta) => oferta.creadorId === usuarioId)
})

const cargarOfertas = async () => {
  try {
    loading.value = true
    ofertas.value = await obtenerMercado()
  } catch (error) {
    console.error(error)
    errorMessage.value = 'No se pudieron cargar tus ofertas.'
  } finally {
    loading.value = false
  }
}

const cancelar = async (id) => {
  try {
    message.value = ''
    errorMessage.value = ''
    processingId.value = id

    const response = await cancelarOferta(id)

    message.value = response.message || 'Oferta cancelada correctamente.'

    await cargarOfertas()
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'No se pudo cancelar la oferta.'
  } finally {
    processingId.value = null
  }
}

onMounted(() => {
  cargarOfertas()
})
</script>

<style scoped>
.oferta-card {
  border-radius: 16px;
}
</style>
