<template>
  <q-page class="q-pa-lg">
    <div class="text-h4 text-primary q-mb-sm">Mercado P2P</div>

    <div class="text-grey-7 q-mb-lg">Explora ofertas activas de cambio de divisas.</div>

    <q-card class="q-pa-md q-mb-lg filter-card">
      <div class="row q-col-gutter-md items-end">
        <div class="col-12 col-md-4">
          <q-select
            outlined
            v-model="tengoMonedaId"
            :options="monedasOptions"
            option-label="label"
            option-value="id"
            emit-value
            map-options
            label="Tengo"
            clearable
          />
        </div>

        <div class="col-12 col-md-2">
          <div class="row justify-center">
            <q-btn
              color="primary"
              icon="swap_horiz"
              round
              dense
              outline
              @click="intercambiarFiltros"
            />
          </div>
        </div>

        <div class="col-12 col-md-4">
          <q-select
            outlined
            v-model="quieroMonedaId"
            :options="monedasOptions"
            option-label="label"
            option-value="id"
            emit-value
            map-options
            label="Quiero"
            clearable
          />
        </div>

        <div class="col-12 col-md-2">
          <div class="row justify-center">
            <q-btn color="primary" label="Limpiar filtros" outline @click="limpiarFiltros" />
          </div>
        </div>
      </div>
    </q-card>

    <q-card class="q-pa-md q-mb-lg filter-card">
      <div class="text-subtitle2 text-primary q-mb-sm">Filtros avanzados</div>
      <div class="row q-col-gutter-md items-end">
        <div class="col-12 col-md-3">
          <q-input outlined v-model="fechaDesde" type="date" label="Desde" clearable />
        </div>

        <div class="col-12 col-md-3">
          <q-input outlined v-model="fechaHasta" type="date" label="Hasta" clearable />
        </div>

        <div class="col-12 col-md-2">
          <q-input
            outlined
            v-model="tasaReferencia"
            type="number"
            label="Tasa"
            clearable
            step="0.0001"
            stack-label
            class="full-width"
          />
        </div>

        <div class="col-12 col-md-2">
          <q-input
            outlined
            v-model="margenTasa"
            type="number"
            label="Margen ±"
            clearable
            step="0.0001"
            stack-label
            class="full-width"
          />
        </div>

        <div class="col-12 col-md-2">
          <div class="row justify-center">
            <q-btn
              color="primary"
              label="Limpiar avanzados"
              outline
              @click="limpiarFiltrosAvanzados"
            />
          </div>
        </div>
      </div>
    </q-card>

    <q-card v-if="mostrarTipoCambioEnVivo" class="q-mb-lg exchange-card">
      <q-card-section>
        <div class="text-subtitle2 text-primary">Tipo de cambio en vivo</div>

        <div v-if="cargandoTipoCambio" class="text-grey-7 q-mt-sm">
          Consultando tipo de cambio...
        </div>
        <div v-else-if="errorTipoCambio" class="text-negative q-mt-sm">{{ errorTipoCambio }}</div>
        <div v-else-if="tipoCambioEnVivo" class="q-mt-sm">
          <div class="text-body2">{{ tipoCambioEnVivo.mensaje }}</div>
          <div class="text-weight-medium">
            Tasa referencial: {{ formatearMonto(tipoCambioEnVivo.tasaCambioReferencial) }}
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-spinner v-if="loading" color="primary" size="40px" />

    <div v-else class="row q-col-gutter-md">
      <div v-for="oferta in ofertas" :key="oferta.ofertaId || oferta.id" class="col-12 col-md-4">
        <q-card class="q-pa-md oferta-card">
          <div class="text-h6">
            {{ oferta.creadorNombre }}
          </div>

          <div class="row items-center q-mt-xs q-mb-sm">
            <q-rating
              readonly
              color="amber"
              :model-value="Number(oferta.calificacionPromedio || 0)"
              :max="5"
              size="18px"
            />

            <span class="q-ml-sm text-caption text-grey-7">
              <template v-if="oferta.totalCalificaciones > 0">
                {{ Number(oferta.calificacionPromedio).toFixed(1) }}
                ({{ oferta.totalCalificaciones }}
                {{ oferta.totalCalificaciones === 1 ? 'calificación' : 'calificaciones' }})
              </template>

              <template v-else> Sin calificaciones </template>
            </span>
          </div>

          <q-chip color="positive" text-color="white" dense class="q-mb-md">
            Oferta disponible
          </q-chip>
          <div class="row q-col-gutter-sm">
            <div class="col-6">
              <div class="text-caption text-grey-7">Tengo</div>
              <div class="text-subtitle1 text-primary">
                {{ getTengoSimbolo(oferta) }} {{ formatearMonto(getTengoMonto(oferta)) }}
                {{ getTengoCodigo(oferta) }}
              </div>
            </div>

            <div class="col-6">
              <div class="text-caption text-grey-7">Quiero</div>
              <div class="text-subtitle1 text-teal-7">
                {{ getQuieroSimbolo(oferta) }} {{ formatearMonto(getQuieroMonto(oferta)) }}
                {{ getQuieroCodigo(oferta) }}
              </div>
            </div>
          </div>

          <q-separator class="q-my-md" />

          <div class="text-grey-8">Tipo de cambio: {{ formatearMonto(getTipoCambio(oferta)) }}</div>
          <div class="text-grey-8 q-mt-sm">
            Publicado: {{ formatearFecha(getFechaPublicacion(oferta)) }}
          </div>

          <q-btn
            color="primary"
            label="Tomar oferta"
            class="full-width q-mt-md"
            :disable="Number(oferta.creadorId) === usuarioId"
            :loading="processingId === getOfertaId(oferta)"
            @click="tomarOferta(oferta)"
          />
        </q-card>
      </div>
    </div>

    <q-banner
      v-if="!loading && ofertas.length === 0"
      class="bg-grey-2 text-grey-8 q-mt-md rounded-borders"
    >
      No hay ofertas activas para los filtros seleccionados.
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
import { computed, onMounted, ref, watch } from 'vue'
import { obtenerMercado, aceptarOferta } from 'src/services/ofertas.service'
import { obtenerMonedasActivas } from 'src/services/monedas.service'
import { obtenerTipoCambioEnVivo } from 'src/services/exchange.service'

const ofertas = ref([])
const ofertasBase = ref([])
const monedas = ref([])
const loading = ref(false)
const processingId = ref(null)
const usuarioId = Number(localStorage.getItem('userId'))
const message = ref('')
const errorMessage = ref('')
const tengoMonedaId = ref(null)
const quieroMonedaId = ref(null)
const tipoCambioEnVivo = ref(null)
const cargandoTipoCambio = ref(false)
const errorTipoCambio = ref('')
const fechaDesde = ref(null)
const fechaHasta = ref(null)
const tasaReferencia = ref(null)
const margenTasa = ref(null)

const monedasOptions = computed(() =>
  monedas.value.map((moneda) => ({
    id: moneda.id,
    label: `${moneda.codigoIso} - ${moneda.nombre}`,
  })),
)

const mostrarTipoCambioEnVivo = computed(() => Boolean(tengoMonedaId.value && quieroMonedaId.value))

const formatearMonto = (valor) => Number(valor || 0).toFixed(2)

const formatearFecha = (valor) => {
  if (!valor) return '—'
  return new Date(valor).toLocaleString('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

const getOfertaId = (oferta) => oferta.ofertaId ?? oferta.id
const getTengoMonto = (oferta) => oferta.pagarMontoCalculado ?? oferta.montoOfrecido ?? 0
const getTengoCodigo = (oferta) => oferta.pagarMonedaCodigo ?? oferta.monedaOrigenCodigo ?? ''
const getTengoSimbolo = (oferta) => oferta.pagarMonedaSimbolo ?? oferta.monedaOrigenSimbolo ?? ''
const getQuieroMonto = (oferta) => oferta.recibirMonto ?? oferta.montoARecibir ?? 0
const getQuieroCodigo = (oferta) => oferta.recibirMonedaCodigo ?? oferta.monedaDestinoCodigo ?? ''
const getQuieroSimbolo = (oferta) =>
  oferta.recibirMonedaSimbolo ?? oferta.monedaDestinoSimbolo ?? ''
const getTipoCambio = (oferta) => oferta.tipoCambioP2P ?? oferta.tasaCambio ?? 0
const getFechaPublicacion = (oferta) => oferta.fechaPublicacion ?? ''

const normalizarCodigo = (valor) => (valor ?? '').toString().trim().toUpperCase()

const getCodigoMonedaSeleccionada = (id) => {
  const moneda = monedas.value.find((item) => Number(item.id) === Number(id))
  return moneda ? normalizarCodigo(moneda.codigoIso) : ''
}

const parsearFechaInput = (valor) => {
  if (!valor) return null

  const [year, month, day] = valor.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const esOfertaCompatible = (oferta) => {
  if (!tengoMonedaId.value || !quieroMonedaId.value) return true

  const monedaTengoFiltro = getCodigoMonedaSeleccionada(tengoMonedaId.value)
  const monedaQuieroFiltro = getCodigoMonedaSeleccionada(quieroMonedaId.value)
  const monedaTengoOferta = normalizarCodigo(getTengoCodigo(oferta))
  const monedaQuieroOferta = normalizarCodigo(getQuieroCodigo(oferta))

  return monedaTengoOferta === monedaQuieroFiltro && monedaQuieroOferta === monedaTengoFiltro
}

const aplicarFiltros = () => {
  const base = ofertasBase.value.filter((oferta) => Number(oferta.creadorId) !== usuarioId)
  let filtradas = base

  if (tengoMonedaId.value && quieroMonedaId.value) {
    filtradas = filtradas.filter((oferta) => esOfertaCompatible(oferta))
  }

  if (fechaDesde.value) {
    const fechaDesdeFiltro = parsearFechaInput(fechaDesde.value)
    filtradas = filtradas.filter((oferta) => {
      const fechaOferta = new Date(oferta.fechaPublicacion)
      return !Number.isNaN(fechaOferta.getTime()) && fechaOferta >= fechaDesdeFiltro
    })
  }

  if (fechaHasta.value) {
    const fechaHastaFiltro = parsearFechaInput(fechaHasta.value)
    filtradas = filtradas.filter((oferta) => {
      const fechaOferta = new Date(oferta.fechaPublicacion)
      return !Number.isNaN(fechaOferta.getTime()) && fechaOferta <= fechaHastaFiltro
    })
  }

  if (
    tasaReferencia.value !== null &&
    tasaReferencia.value !== '' &&
    tasaReferencia.value !== undefined
  ) {
    const tasa = Number(tasaReferencia.value)
    const margen = Number(margenTasa.value || 0)
    const minimo = tasa - margen
    const maximo = tasa + margen

    filtradas = filtradas.filter((oferta) => {
      const tipoCambio = Number(getTipoCambio(oferta) || 0)
      return tipoCambio >= minimo && tipoCambio <= maximo
    })
  }

  ofertas.value = filtradas
}

const cargarMonedas = async () => {
  try {
    monedas.value = await obtenerMonedasActivas()
  } catch (error) {
    console.error(error)
    errorMessage.value = 'No se pudieron cargar las monedas.'
  }
}

const cargarOfertas = async () => {
  try {
    loading.value = true
    message.value = ''
    errorMessage.value = ''

    const data = await obtenerMercado()
    ofertasBase.value = (data || []).filter((oferta) => Number(oferta.creadorId) !== usuarioId)
    aplicarFiltros()
  } catch (error) {
    console.error(error)
    errorMessage.value = 'No se pudieron cargar las ofertas.'
  } finally {
    loading.value = false
  }
}

const limpiarFiltros = () => {
  tengoMonedaId.value = null
  quieroMonedaId.value = null
  tipoCambioEnVivo.value = null
  errorTipoCambio.value = ''
}

const limpiarFiltrosAvanzados = () => {
  fechaDesde.value = null
  fechaHasta.value = null
  tasaReferencia.value = null
  margenTasa.value = null
}

const cargarTipoCambioEnVivo = async () => {
  const codigoTengo = getCodigoMonedaSeleccionada(tengoMonedaId.value)
  const codigoQuiero = getCodigoMonedaSeleccionada(quieroMonedaId.value)

  if (!codigoTengo || !codigoQuiero) {
    tipoCambioEnVivo.value = null
    errorTipoCambio.value = ''
    return
  }

  try {
    cargandoTipoCambio.value = true
    errorTipoCambio.value = ''

    const data = await obtenerTipoCambioEnVivo(codigoTengo, codigoQuiero)

    tipoCambioEnVivo.value = data
  } catch (error) {
    console.error(error)
    tipoCambioEnVivo.value = null
    errorTipoCambio.value = 'No se pudo obtener el tipo de cambio en vivo.'
  } finally {
    cargandoTipoCambio.value = false
  }
}

const intercambiarFiltros = () => {
  const temporal = tengoMonedaId.value
  tengoMonedaId.value = quieroMonedaId.value
  quieroMonedaId.value = temporal
}

const tomarOferta = async (oferta) => {
  try {
    message.value = ''
    errorMessage.value = ''
    processingId.value = getOfertaId(oferta)

    const response = await aceptarOferta(getOfertaId(oferta), {
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

watch(
  [tengoMonedaId, quieroMonedaId, monedas, fechaDesde, fechaHasta, tasaReferencia, margenTasa],
  () => {
    aplicarFiltros()
    cargarTipoCambioEnVivo()
  },
)

onMounted(() => {
  cargarMonedas()
  cargarOfertas()
})
</script>

<style scoped>
.filter-card {
  border-radius: 16px;
}

.oferta-card {
  border-radius: 16px;
}

.exchange-card {
  border-radius: 16px;
}
</style>
