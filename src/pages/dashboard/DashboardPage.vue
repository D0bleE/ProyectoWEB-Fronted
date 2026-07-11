<template>
  <q-page class="q-pa-lg">
    <!-- ENCABEZADO -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-primary">Bienvenido, {{ userName }}</div>

        <div class="text-grey-7 q-mt-xs">
          Consulta y simula conversiones con las monedas activas de la plataforma.
        </div>
      </div>

      <q-btn
        outline
        color="primary"
        icon="refresh"
        label="Actualizar tasa"
        :loading="loadingTasa"
        :disable="!parValido"
        @click="consultarTipoCambio"
      />
    </div>

    <!-- ERROR GENERAL -->
    <q-banner v-if="errorMessage" class="bg-red-1 text-negative q-mb-md rounded-borders">
      {{ errorMessage }}
    </q-banner>

    <!-- CARGA DE MONEDAS -->
    <div v-if="loadingMonedas" class="row justify-center q-pa-xl">
      <q-spinner color="primary" size="45px" />
    </div>

    <template v-else>
      <!-- CONVERSOR -->
      <q-card flat bordered class="dashboard-card">
        <q-card-section>
          <div class="row items-center justify-between">
            <div>
              <div class="text-h6">Conversor de monedas</div>
              <div class="text-grey-7">
                Selecciona dos monedas distintas para consultar el tipo de cambio.
              </div>
            </div>

            <q-chip v-if="ultimaActualizacion" color="blue-1" text-color="primary" icon="schedule">
              Actualizado: {{ formatearFechaHora(ultimaActualizacion) }}
            </q-chip>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div class="row q-col-gutter-md">
            <!-- MONEDA ORIGEN -->
            <div class="col-12 col-md-5">
              <q-select
                outlined
                v-model="monedaOrigenId"
                :options="monedasOrigenOptions"
                option-label="label"
                option-value="id"
                emit-value
                map-options
                label="Moneda de origen"
                @update:model-value="alCambiarOrigen"
              >
                <template #prepend>
                  <q-avatar v-if="monedaOrigen" size="28px">
                    <img :src="monedaOrigen.rutaBandera" />
                  </q-avatar>

                  <q-icon v-else name="paid" />
                </template>

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
                        {{ scope.opt.simbolo }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>

            <!-- BOTÓN INVERTIR -->
            <div class="col-12 col-md-2 column justify-center items-center">
              <q-btn
                round
                outline
                color="primary"
                icon="swap_horiz"
                :disable="!parValido || loadingTasa"
                @click="invertirMonedas"
              >
                <q-tooltip>Invertir monedas</q-tooltip>
              </q-btn>
            </div>

            <!-- MONEDA DESTINO -->
            <div class="col-12 col-md-5">
              <q-select
                outlined
                v-model="monedaDestinoId"
                :options="monedasDestinoOptions"
                option-label="label"
                option-value="id"
                emit-value
                map-options
                label="Moneda de destino"
                @update:model-value="consultarTipoCambio"
              >
                <template #prepend>
                  <q-avatar v-if="monedaDestino" size="28px">
                    <img :src="monedaDestino.rutaBandera" />
                  </q-avatar>

                  <q-icon v-else name="currency_exchange" />
                </template>

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
                        {{ scope.opt.simbolo }}
                      </q-item-label>
                    </q-item-section>
                  </q-item>
                </template>

                <template #no-option>
                  <q-item>
                    <q-item-section class="text-grey">
                      No hay otra moneda activa disponible.
                    </q-item-section>
                  </q-item>
                </template>
              </q-select>
            </div>
          </div>

          <!-- AVISO MISMA MONEDA -->
          <q-banner
            v-if="monedaOrigenId && monedaDestinoId && monedaOrigenId === monedaDestinoId"
            class="bg-red-1 text-negative q-mt-md rounded-borders"
          >
            La moneda de origen y destino no pueden ser iguales.
          </q-banner>

          <!-- MONTO -->
          <div class="row q-col-gutter-md q-mt-md">
            <div class="col-12 col-md-6">
              <q-input
                outlined
                v-model.number="montoOrigen"
                type="number"
                min="0"
                step="0.01"
                label="Monto a convertir"
                :disable="!parValido"
              >
                <template #prepend>
                  <span class="text-primary text-weight-bold">
                    {{ monedaOrigen?.simbolo || '' }}
                  </span>
                </template>

                <template #append>
                  <span class="text-caption text-weight-bold">
                    {{ monedaOrigen?.codigoIso || '' }}
                  </span>
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-6">
              <q-input
                outlined
                readonly
                :model-value="montoConvertidoFormateado"
                label="Monto aproximado a recibir"
              >
                <template #prepend>
                  <span class="text-positive text-weight-bold">
                    {{ monedaDestino?.simbolo || '' }}
                  </span>
                </template>

                <template #append>
                  <span class="text-caption text-weight-bold">
                    {{ monedaDestino?.codigoIso || '' }}
                  </span>
                </template>
              </q-input>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- TARJETA DE TASA -->
      <div class="row q-col-gutter-md q-mt-md">
        <div class="col-12 col-md-7">
          <q-card flat bordered class="dashboard-card rate-card">
            <q-card-section>
              <div class="text-subtitle2 text-grey-7">Tipo de cambio referencial</div>

              <div v-if="loadingTasa" class="q-py-lg text-center">
                <q-spinner-dots color="primary" size="42px" />
              </div>

              <template v-else-if="parValido && tasaCambio > 0">
                <div class="row items-center q-gutter-md q-mt-md">
                  <q-avatar size="48px">
                    <img :src="monedaOrigen?.rutaBandera" />
                  </q-avatar>

                  <div class="text-h4 text-primary">
                    1 {{ monedaOrigen?.codigoIso }}
                    =
                    {{ formatoTipoCambio(tasaCambio) }}
                    {{ monedaDestino?.codigoIso }}
                  </div>

                  <q-avatar size="48px">
                    <img :src="monedaDestino?.rutaBandera" />
                  </q-avatar>
                </div>

                <div class="text-grey-7 q-mt-md">
                  {{ mensajeReferencia }}
                </div>
              </template>

              <q-banner v-else class="bg-grey-2 text-grey-8 rounded-borders">
                Selecciona un par de monedas para consultar su tasa.
              </q-banner>
            </q-card-section>
          </q-card>
        </div>

        <!-- RESUMEN -->
        <div class="col-12 col-md-5">
          <q-card flat bordered class="dashboard-card">
            <q-card-section>
              <div class="text-h6 q-mb-md">Resumen de conversión</div>

              <q-list separator>
                <q-item>
                  <q-item-section>
                    <q-item-label caption>Entregas</q-item-label>
                    <q-item-label class="text-h6">
                      {{ monedaOrigen?.simbolo || '' }}
                      {{ montoOrigenValido.toFixed(2) }}
                      {{ monedaOrigen?.codigoIso || '' }}
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    <q-item-label caption>Recibirías aproximadamente</q-item-label>
                    <q-item-label class="text-h6 text-positive">
                      {{ monedaDestino?.simbolo || '' }}
                      {{ montoConvertidoFormateado }}
                      {{ monedaDestino?.codigoIso || '' }}
                    </q-item-label>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    <q-item-label caption>Monedas activas disponibles</q-item-label>
                    <q-item-label class="text-h6">
                      {{ monedas.length }}
                    </q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- GRÁFICO DE CONSULTAS DE LA SESIÓN -->
      <q-card flat bordered class="dashboard-card q-mt-md">
        <q-card-section class="row items-center justify-between">
          <div>
            <div class="text-h6">Seguimiento de tasa: {{ codigoPar }}</div>

            <div class="text-grey-7">Consultas realizadas durante esta sesión</div>
          </div>

          <q-btn
            flat
            color="negative"
            icon="delete_outline"
            label="Limpiar"
            :disable="historialSesion.length === 0"
            @click="limpiarHistorial"
          />
        </q-card-section>

        <q-separator />

        <q-card-section>
          <div v-if="historialSesion.length < 2" class="text-center text-grey-7 q-pa-xl">
            Actualiza la tasa al menos dos veces para visualizar su evolución durante esta sesión.
          </div>

          <div v-else class="chart-container">
            <canvas
              ref="chartCanvas"
              class="chart-canvas"
              @mousemove="handleChartHover"
              @mouseleave="hoveredPoint = null"
            />

            <div
              v-if="hoveredPoint"
              class="chart-crosshair"
              :style="{ left: `${hoveredPoint.x}px` }"
            />

            <div
              v-if="hoveredPoint"
              class="chart-tooltip"
              :style="{
                left: `${hoveredPoint.x}px`,
                top: `${hoveredPoint.y - 12}px`,
              }"
            >
              <div>{{ hoveredPoint.fecha }}</div>
              <strong>
                {{ formatoTipoCambio(hoveredPoint.tasa) }}
                {{ monedaDestino?.codigoIso }}
              </strong>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </template>
  </q-page>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { obtenerMonedasActivas } from 'src/services/monedas.service'
import { obtenerTipoCambioEnVivo } from 'src/services/exchange.service'

const userName = localStorage.getItem('userName') || 'Usuario'

const monedas = ref([])
const monedaOrigenId = ref(null)
const monedaDestinoId = ref(null)
const montoOrigen = ref(100)

const tasaCambio = ref(0)
const mensajeReferencia = ref('')
const ultimaActualizacion = ref(null)

const loadingMonedas = ref(false)
const loadingTasa = ref(false)
const errorMessage = ref('')

const historialSesion = ref([])
const chartCanvas = ref(null)
const hoveredPoint = ref(null)

const monedasOrigenOptions = computed(() =>
  monedas.value.map((moneda) => ({
    id: moneda.id,
    codigo: moneda.codigoIso,
    nombre: moneda.nombre,
    simbolo: moneda.simbolo,
    bandera: moneda.rutaBandera,
    label: `${moneda.codigoIso} - ${moneda.nombre}`,
  })),
)

const monedasDestinoOptions = computed(() =>
  monedas.value
    .filter((moneda) => moneda.id !== monedaOrigenId.value)
    .map((moneda) => ({
      id: moneda.id,
      codigo: moneda.codigoIso,
      nombre: moneda.nombre,
      simbolo: moneda.simbolo,
      bandera: moneda.rutaBandera,
      label: `${moneda.codigoIso} - ${moneda.nombre}`,
    })),
)

const monedaOrigen = computed(() =>
  monedas.value.find((moneda) => moneda.id === monedaOrigenId.value),
)

const monedaDestino = computed(() =>
  monedas.value.find((moneda) => moneda.id === monedaDestinoId.value),
)

const parValido = computed(() => {
  return monedaOrigen.value && monedaDestino.value && monedaOrigenId.value !== monedaDestinoId.value
})

const montoOrigenValido = computed(() => {
  const monto = Number(montoOrigen.value)
  return Number.isFinite(monto) && monto > 0 ? monto : 0
})

const montoConvertido = computed(() => {
  if (!parValido.value || tasaCambio.value <= 0) return 0

  return montoOrigenValido.value * Number(tasaCambio.value)
})

const montoConvertidoFormateado = computed(() => montoConvertido.value.toFixed(2))

const codigoPar = computed(() => {
  if (!monedaOrigen.value || !monedaDestino.value) return '-'

  return `${monedaOrigen.value.codigoIso} → ${monedaDestino.value.codigoIso}`
})

const cargarMonedas = async () => {
  try {
    loadingMonedas.value = true
    errorMessage.value = ''

    monedas.value = await obtenerMonedasActivas()

    if (monedas.value.length >= 2) {
      monedaOrigenId.value = monedas.value[0].id
      monedaDestinoId.value = monedas.value[1].id

      await consultarTipoCambio()
    } else {
      errorMessage.value = 'Se necesitan al menos dos monedas activas para realizar conversiones.'
    }
  } catch (error) {
    console.error(error)
    errorMessage.value = 'No se pudieron cargar las monedas activas.'
  } finally {
    loadingMonedas.value = false
  }
}

const alCambiarOrigen = async () => {
  if (monedaDestinoId.value === monedaOrigenId.value) {
    const primeraDisponible = monedas.value.find((moneda) => moneda.id !== monedaOrigenId.value)

    monedaDestinoId.value = primeraDisponible?.id ?? null
  }

  historialSesion.value = []

  await consultarTipoCambio()
}

const consultarTipoCambio = async () => {
  if (!parValido.value || loadingTasa.value) return

  try {
    loadingTasa.value = true
    errorMessage.value = ''

    const response = await obtenerTipoCambioEnVivo(
      monedaOrigen.value.codigoIso,
      monedaDestino.value.codigoIso,
    )

    tasaCambio.value = Number(response.tasaCambioReferencial || 0)
    mensajeReferencia.value =
      response.mensaje ||
      `1 ${monedaOrigen.value.codigoIso} equivale a ${tasaCambio.value} ${monedaDestino.value.codigoIso}`

    ultimaActualizacion.value = response.fechaActualizacion || new Date().toISOString()

    agregarPuntoHistorial()
  } catch (error) {
    console.error(error)

    tasaCambio.value = 0
    mensajeReferencia.value = ''

    errorMessage.value =
      error.response?.data?.message ||
      'No se pudo consultar el tipo de cambio para el par seleccionado.'
  } finally {
    loadingTasa.value = false
  }
}

const agregarPuntoHistorial = () => {
  const ahora = new Date()

  historialSesion.value.push({
    fecha: ahora.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    tasa: Number(tasaCambio.value),
  })

  if (historialSesion.value.length > 20) {
    historialSesion.value.shift()
  }

  nextTick(drawChart)
}

const invertirMonedas = async () => {
  const origenAnterior = monedaOrigenId.value

  monedaOrigenId.value = monedaDestinoId.value
  monedaDestinoId.value = origenAnterior

  historialSesion.value = []

  await consultarTipoCambio()
}

const limpiarHistorial = () => {
  historialSesion.value = []
  hoveredPoint.value = null

  const canvas = chartCanvas.value

  if (canvas) {
    const context = canvas.getContext('2d')
    context?.clearRect(0, 0, canvas.width, canvas.height)
  }
}

const formatoTipoCambio = (value) => {
  const numero = Number(value)

  if (!Number.isFinite(numero) || numero <= 0) return '-'

  return numero.toLocaleString('es-PE', {
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  })
}

const formatearFechaHora = (fecha) => {
  if (!fecha) return '-'

  return new Date(fecha).toLocaleString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const drawChart = () => {
  const canvas = chartCanvas.value

  if (!canvas || historialSesion.value.length < 2) return

  const containerWidth = canvas.parentElement?.clientWidth || 900
  const width = Math.max(containerWidth, 500)
  const height = 320
  const dpr = window.devicePixelRatio || 1

  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  const ctx = canvas.getContext('2d')

  if (!ctx) return

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, width, height)

  const padding = {
    top: 28,
    right: 24,
    bottom: 44,
    left: 70,
  }

  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom

  const valores = historialSesion.value.map((punto) => punto.tasa)
  const minimoOriginal = Math.min(...valores)
  const maximoOriginal = Math.max(...valores)

  const margen = Math.max(
    (maximoOriginal - minimoOriginal) * 0.15,
    maximoOriginal * 0.002,
    0.000001,
  )

  const minimo = minimoOriginal - margen
  const maximo = maximoOriginal + margen
  const rango = maximo - minimo || 1

  ctx.font = '12px Arial'
  ctx.strokeStyle = '#e0e0e0'
  ctx.fillStyle = '#757575'
  ctx.lineWidth = 1

  const lineas = 5

  for (let i = 0; i <= lineas; i += 1) {
    const y = padding.top + (plotHeight / lineas) * i

    ctx.beginPath()
    ctx.moveTo(padding.left, y)
    ctx.lineTo(width - padding.right, y)
    ctx.stroke()

    const valor = maximo - (rango / lineas) * i

    ctx.textAlign = 'right'
    ctx.fillText(valor.toFixed(6), padding.left - 8, y + 4)
  }

  const puntos = historialSesion.value.map((item, index) => {
    const x = padding.left + (plotWidth * index) / Math.max(historialSesion.value.length - 1, 1)

    const y = padding.top + ((maximo - item.tasa) / rango) * plotHeight

    return {
      ...item,
      x,
      y,
    }
  })

  ctx.strokeStyle = '#1976d2'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(puntos[0].x, puntos[0].y)

  for (let index = 1; index < puntos.length; index += 1) {
    ctx.lineTo(puntos[index].x, puntos[index].y)
  }

  ctx.stroke()

  ctx.fillStyle = '#1976d2'

  puntos.forEach((punto) => {
    ctx.beginPath()
    ctx.arc(punto.x, punto.y, 4, 0, Math.PI * 2)
    ctx.fill()
  })

  ctx.fillStyle = '#757575'
  ctx.textAlign = 'center'

  const salto = Math.max(1, Math.ceil(puntos.length / 6))

  puntos.forEach((punto, index) => {
    if (index % salto === 0 || index === puntos.length - 1) {
      ctx.fillText(punto.fecha.slice(0, 5), punto.x, height - padding.bottom + 20)
    }
  })
}

const handleChartHover = (event) => {
  const canvas = chartCanvas.value

  if (!canvas || historialSesion.value.length < 2) return

  const rect = canvas.getBoundingClientRect()
  const mouseX = event.clientX - rect.left

  const width = rect.width

  const padding = {
    left: 70,
    right: 24,
  }

  const plotWidth = width - padding.left - padding.right

  if (mouseX < padding.left || mouseX > width - padding.right) {
    hoveredPoint.value = null
    return
  }

  const indice = Math.round(
    ((mouseX - padding.left) / plotWidth) * (historialSesion.value.length - 1),
  )

  const indiceSeguro = Math.max(0, Math.min(indice, historialSesion.value.length - 1))

  const valores = historialSesion.value.map((punto) => punto.tasa)
  const minimoOriginal = Math.min(...valores)
  const maximoOriginal = Math.max(...valores)

  const margen = Math.max(
    (maximoOriginal - minimoOriginal) * 0.15,
    maximoOriginal * 0.002,
    0.000001,
  )

  const minimo = minimoOriginal - margen
  const maximo = maximoOriginal + margen
  const rango = maximo - minimo || 1

  const plotHeight = 320 - 28 - 44
  const punto = historialSesion.value[indiceSeguro]

  const x =
    padding.left + (plotWidth * indiceSeguro) / Math.max(historialSesion.value.length - 1, 1)

  const y = 28 + ((maximo - punto.tasa) / rango) * plotHeight

  hoveredPoint.value = {
    ...punto,
    x,
    y,
  }
}

const redibujarAlCambiarTamano = () => {
  nextTick(drawChart)
}

watch(
  () => monedaDestinoId.value,
  async (nuevoDestino, destinoAnterior) => {
    if (!nuevoDestino || nuevoDestino === destinoAnterior) return

    historialSesion.value = []

    await consultarTipoCambio()
  },
)

watch(
  () => historialSesion.value.length,
  () => {
    nextTick(drawChart)
  },
)

onMounted(async () => {
  window.addEventListener('resize', redibujarAlCambiarTamano)
  await cargarMonedas()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', redibujarAlCambiarTamano)
})
</script>

<style scoped>
.dashboard-card {
  border-radius: 18px;
}

.rate-card {
  min-height: 210px;
}

.chart-container {
  position: relative;
  width: 100%;
  overflow-x: auto;
}

.chart-canvas {
  display: block;
  width: 100%;
  min-height: 320px;
  cursor: crosshair;
}

.chart-crosshair {
  position: absolute;
  top: 28px;
  bottom: 44px;
  width: 1px;
  background: rgba(25, 118, 210, 0.45);
  pointer-events: none;
  transform: translateX(-50%);
}

.chart-tooltip {
  position: absolute;
  transform: translate(-50%, -100%);
  background: rgba(33, 33, 33, 0.95);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  pointer-events: none;
  white-space: nowrap;
  z-index: 2;
}
</style>
