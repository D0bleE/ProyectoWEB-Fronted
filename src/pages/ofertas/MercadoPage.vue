<template>
  <q-page class="q-pa-lg">
    <div class="text-h4 text-primary q-mb-sm">Mercado P2P</div>

    <div class="text-grey-7 q-mb-lg">Explora ofertas activas de cambio de divisas.</div>

    <q-spinner v-if="loading" color="primary" size="40px" />

    <div v-else class="row q-col-gutter-md">
      <div v-for="oferta in ofertas" :key="oferta.id" class="col-12 col-md-4">
        <q-card class="q-pa-md oferta-card">
          <div class="text-h6">
            {{ oferta.creadorNombre }}
          </div>

          <div class="text-grey-7 q-mb-md">Oferta disponible</div>

          <div class="text-caption text-grey-7">Entrega</div>

          <div class="text-h6 text-primary">
            {{ oferta.monedaOrigenSimbolo }}
            {{ oferta.montoOfrecido.toFixed(2) }}
            {{ oferta.monedaOrigenCodigo }}
          </div>

          <div class="text-caption text-grey-7 q-mt-md">Recibe</div>

          <div class="text-h6 text-teal-7">
            {{ oferta.monedaDestinoSimbolo }}
            {{ oferta.montoARecibir.toFixed(2) }}
            {{ oferta.monedaDestinoCodigo }}
          </div>

          <q-separator class="q-my-md" />

          <div class="text-grey-8">Tipo de cambio: {{ oferta.tasaCambio }}</div>

          <q-btn
            color="primary"
            label="Tomar oferta"
            class="full-width q-mt-md"
            :loading="processingId === oferta.id"
            @click="tomarOferta(oferta)"
          />
        </q-card>
      </div>
    </div>

    <q-banner
      v-if="!loading && ofertas.length === 0"
      class="bg-grey-2 text-grey-8 q-mt-md rounded-borders"
    >
      No hay ofertas activas por el momento.
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
import { onMounted, ref } from 'vue'
import { obtenerMercado, aceptarOferta } from 'src/services/ofertas.service'

const ofertas = ref([])
const loading = ref(false)
const processingId = ref(null)
const usuarioId = Number(localStorage.getItem('userId'))
const message = ref('')
const errorMessage = ref('')

const cargarOfertas = async () => {
  try {
    loading.value = true
    const data = await obtenerMercado()
    ofertas.value = data.filter((oferta) => oferta.creadorId !== usuarioId)
  } catch (error) {
    console.error(error)
    errorMessage.value = 'No se pudieron cargar las ofertas.'
  } finally {
    loading.value = false
  }
}

const tomarOferta = async (oferta) => {
  try {
    message.value = ''
    errorMessage.value = ''
    processingId.value = oferta.id

    const response = await aceptarOferta(oferta.id, {
      compradorUsuarioId: usuarioId,
    })

    message.value = response.message || 'Oferta tomada correctamente.'

    await cargarOfertas()
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'No se pudo tomar la oferta.'
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
