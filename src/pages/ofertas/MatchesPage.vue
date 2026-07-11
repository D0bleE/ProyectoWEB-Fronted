<template>
  <q-page class="q-pa-lg">
    <div class="text-h4 text-primary q-mb-sm">Mis Matches</div>

    <div class="text-grey-7 q-mb-lg">Estas son las ofertas compatibles con las tuyas.</div>

    <q-spinner v-if="loading" color="primary" size="40px" />

    <div v-else class="row q-col-gutter-md">
      <div v-for="match in matches" :key="match.ofertaId" class="col-12 col-md-4">
        <q-card class="q-pa-md oferta-card">
          <div class="text-h6">
            {{ match.creadorNombre }}
          </div>

          <q-chip color="positive" text-color="white" dense class="q-mb-md">
            Match encontrado
          </q-chip>

          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <div class="text-caption text-grey-7">Tu oferta</div>

              <div class="text-subtitle1 text-primary">#{{ match.miOfertaId }}</div>
            </div>

            <div class="col-6">
              <div class="text-caption text-grey-7">Oferta compatible</div>

              <div class="text-subtitle1 text-teal-7">#{{ match.ofertaId }}</div>
            </div>
          </div>

          <q-separator class="q-my-md" />

          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <div class="text-caption text-grey-7">Ofrece</div>

              <div class="text-subtitle1 text-primary">
                {{ match.montoOfrecido }}
                {{ match.monedaOrigenCodigo }}
              </div>
            </div>

            <div class="col-6">
              <div class="text-caption text-grey-7">Quiere</div>

              <div class="text-subtitle1 text-teal-7">
                {{ match.monedaDestinoCodigo }}
              </div>
            </div>
          </div>

          <q-btn
            class="full-width q-mt-md"
            color="primary"
            label="Tomar oferta"
            @click="tomarOferta(match)"
          />
        </q-card>
      </div>
      <div v-if="matches.length === 0" class="col-12">
        <q-banner class="bg-grey-2"> No tienes matches disponibles. </q-banner>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Notify } from 'quasar'
import { obtenerMatches, aceptarOferta } from 'src/services/ofertas.service'

const matches = ref([])
const loading = ref(false)

const usuarioId = Number(localStorage.getItem('userId'))

const tomarOferta = async (match) => {
  try {
    await aceptarOferta(match.ofertaId, {
      compradorUsuarioId: usuarioId,
    })

    cargarMatches()
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: error.response?.data?.message || 'No fue posible aceptar la oferta.',
    })
  }
}

const cargarMatches = async () => {
  try {
    loading.value = true

    matches.value = await obtenerMatches(usuarioId)
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  cargarMatches()
})
</script>

<style scoped>
.oferta-card {
  border-radius: 16px;
}
</style>
