<template>
  <q-page class="q-pa-lg">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-primary">Bienvenido, {{ userName }}</div>
        <div class="text-grey-7 q-mt-sm">Resumen general de tu cuenta P2P Divisas.</div>
      </div>

      <q-btn
        outline
        color="primary"
        icon="refresh"
        label="Actualizar"
        :loading="loading"
        @click="cargarDashboard"
      />
    </div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-3">
        <q-card class="dashboard-card">
          <q-card-section>
            <q-icon name="account_balance_wallet" size="34px" color="primary" />
            <div class="text-grey-7 q-mt-sm">Billeteras</div>
            <div class="text-h5">{{ billeteras.length }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="dashboard-card">
          <q-card-section>
            <q-icon name="currency_exchange" size="34px" color="teal" />
            <div class="text-grey-7 q-mt-sm">Ofertas activas</div>
            <div class="text-h5">{{ ofertasActivas.length }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="dashboard-card">
          <q-card-section>
            <q-icon name="payments" size="34px" color="orange" />
            <div class="text-grey-7 q-mt-sm">Movimientos pendientes</div>
            <div class="text-h5">{{ movimientosPendientes }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-3">
        <q-card class="dashboard-card">
          <q-card-section>
            <q-icon name="swap_horiz" size="34px" color="purple" />
            <div class="text-grey-7 q-mt-sm">Operaciones P2P</div>
            <div class="text-h5">{{ historialP2P.length }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mt-md">
      <div class="col-12 col-md-7">
        <q-card class="dashboard-card">
          <q-card-section>
            <div class="text-h6 q-mb-md">Mis saldos</div>

            <q-list bordered separator>
              <q-item v-for="billetera in billeteras" :key="billetera.monedaId">
                <q-item-section avatar>
                  <q-avatar size="36px">
                    <img :src="billetera.monedaBandera" />
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label>
                    {{ billetera.monedaCodigo }} - {{ billetera.monedaNombre }}
                  </q-item-label>
                  <q-item-label caption>
                    Bloqueado:
                    {{ billetera.monedaSimbolo }}
                    {{ billetera.saldoBloqueado.toFixed(2) }}
                  </q-item-label>
                </q-item-section>

                <q-item-section side>
                  <div class="text-teal-7 text-weight-bold">
                    {{ billetera.monedaSimbolo }}
                    {{ billetera.saldoDisponible.toFixed(2) }}
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-5">
        <q-card class="dashboard-card">
          <q-card-section>
            <div class="text-h6 q-mb-md">Accesos rápidos</div>

            <div class="column q-gutter-sm">
              <q-btn color="primary" icon="add" label="Crear oferta" to="/ofertas/crear" />
              <q-btn
                outline
                color="primary"
                icon="storefront"
                label="Ir al mercado"
                to="/mercado"
              />
              <q-btn
                outline
                color="teal"
                icon="account_balance_wallet"
                label="Mis billeteras"
                to="/billeteras"
              />
              <q-btn outline color="grey-8" icon="history" label="Ver historial" to="/historial" />
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-md q-mt-md">
      <div class="col-12 col-md-4">
        <q-card class="dashboard-card">
          <q-card-section>
            <div class="text-subtitle2 text-grey-7">Referencia</div>
            <div class="text-h6">PEN → USD</div>
            <div class="text-h4 text-primary">
              {{ formatoTipoCambio(rates.usd) }}
            </div>
            <div class="text-caption text-grey-7">
              {{ rates.mensajes.usd }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="dashboard-card">
          <q-card-section>
            <div class="text-subtitle2 text-grey-7">Referencia</div>
            <div class="text-h6">PEN → EUR</div>
            <div class="text-h4 text-primary">
              {{ formatoTipoCambio(rates.eur) }}
            </div>
            <div class="text-caption text-grey-7">
              {{ rates.mensajes.eur }}
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="dashboard-card">
          <q-card-section>
            <div class="text-subtitle2 text-grey-7">Referencia</div>
            <div class="text-h6">PEN → CNY</div>
            <div class="text-h4 text-primary">
              {{ formatoTipoCambio(rates.cny) }}
            </div>
            <div class="text-caption text-grey-7">
              {{ rates.mensajes.cny }}
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-card class="dashboard-card q-mt-md">
      <q-card-section>
        <div class="text-h6 q-mb-md">Simulador rápido</div>

        <div class="row q-col-gutter-md">
          <div class="col-12 col-md-3">
            <q-input outlined v-model.number="simulador.pen" type="number" label="Monto en PEN" />
          </div>

          <div class="col-12 col-md-3">
            <q-input outlined readonly :model-value="simular(rates.usd)" label="Equivalente USD" />
          </div>

          <div class="col-12 col-md-3">
            <q-input outlined readonly :model-value="simular(rates.eur)" label="Equivalente EUR" />
          </div>

          <div class="col-12 col-md-3">
            <q-input outlined readonly :model-value="simular(rates.cny)" label="Equivalente CNY" />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-banner v-if="errorMessage" class="bg-red-1 text-negative q-mt-md rounded-borders">
      {{ errorMessage }}
    </q-banner>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { obtenerSaldosPorUsuario } from 'src/services/billeteras.service'
import { obtenerMercado, obtenerHistorialP2P } from 'src/services/ofertas.service'
import { obtenerMovimientosPorUsuario } from 'src/services/movimientos.service'
import { fetchExchangeRates } from 'src/services/exchange.service'

const userName = localStorage.getItem('userName') || 'Usuario'
const usuarioId = localStorage.getItem('userId')

const loading = ref(false)
const errorMessage = ref('')

const billeteras = ref([])
const mercado = ref([])
const movimientos = ref([])
const historialP2P = ref([])

const rates = ref({
  usd: 0,
  eur: 0,
  cny: 0,
  mensajes: {
    usd: '',
    eur: '',
    cny: '',
  },
})

const simulador = ref({
  pen: 100,
})

const ofertasActivas = computed(() =>
  mercado.value.filter((oferta) => oferta.creadorId === Number(usuarioId)),
)

const movimientosPendientes = computed(
  () => movimientos.value.filter((m) => m.estado === 'PENDIENTE').length,
)

const formatoTipoCambio = (value) => {
  return value ? Number(value).toFixed(4) : '-'
}

const simular = (rate) => {
  const pen = Number(simulador.value.pen) || 0
  const tasa = Number(rate) || 0
  return (pen * tasa).toFixed(2)
}

const cargarDashboard = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    const [billeterasData, mercadoData, movimientosData, historialData, exchangeData] =
      await Promise.all([
        obtenerSaldosPorUsuario(usuarioId),
        obtenerMercado(),
        obtenerMovimientosPorUsuario(usuarioId),
        obtenerHistorialP2P(usuarioId),
        fetchExchangeRates(),
      ])

    billeteras.value = billeterasData
    mercado.value = mercadoData
    movimientos.value = movimientosData
    historialP2P.value = historialData
    rates.value = exchangeData
  } catch (error) {
    console.error(error)
    errorMessage.value = 'No se pudo cargar la información del dashboard.'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  cargarDashboard()
})
</script>

<style scoped>
.dashboard-card {
  border-radius: 16px;
}
</style>
