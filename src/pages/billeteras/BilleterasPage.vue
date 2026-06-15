<template>
  <q-page class="q-pa-lg">
    <div class="row justify-between items-center q-mb-sm">
      <div>
        <div class="text-h4 text-primary">Mis billeteras</div>
        <div class="text-grey-7">Consulta tus saldos disponibles y bloqueados por moneda.</div>
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
            {{ billetera.monedaSimbolo }}
            {{ billetera.saldoDisponible.toFixed(2) }}
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
      No se encontraron billeteras para este usuario.
    </q-banner>

    <q-banner v-if="errorMessage" class="bg-red-1 text-negative q-mt-md rounded-borders">
      {{ errorMessage }}
    </q-banner>
  </q-page>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { obtenerSaldosPorUsuario } from 'src/services/billeteras.service'

const billeteras = ref([])
const loading = ref(false)
const errorMessage = ref('')

const usuarioId = localStorage.getItem('userId')

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

onMounted(() => {
  cargarBilleteras()
})
</script>

<style scoped>
.wallet-card {
  border-radius: 16px;
}
</style>
