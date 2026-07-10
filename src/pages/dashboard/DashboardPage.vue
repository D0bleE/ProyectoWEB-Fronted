<template>
  <q-page class="q-pa-lg">
    <div class="row items-center justify-between">
      <div>
        <div class="text-h4 text-primary">Bienvenido, {{ userName }} 👋</div>
        <div class="text-grey-7 q-mt-sm">Plataforma P2P de cambio de divisas.</div>
      </div>
      <q-btn
        color="primary"
        label="Actualizar"
        outline
        @click="loadExchangeData"
        :loading="loading"
      />
    </div>

    <div class="row q-col-gutter-md q-mt-lg">
      <div class="col-12 col-md-4">
        <q-card flat bordered class="dashboard-card">
          <q-card-section>
            <div class="text-subtitle2 text-secondary">Soles a Dólares</div>
            <div class="text-h6 q-mt-sm text-secondary">Tipo de cambio</div>
            <div class="text-h4 text-primary q-mt-xs">{{ formatoTipoCambio(rates.usd) }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card flat bordered class="dashboard-card">
          <q-card-section>
            <div class="text-subtitle2 text-secondary">Soles a Euros</div>
            <div class="text-h6 q-mt-sm text-secondary">Tipo de cambio</div>
            <div class="text-h4 text-primary q-mt-xs">{{ formatoTipoCambio(rates.eur) }}</div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card flat bordered class="dashboard-card">
          <q-card-section>
            <div class="text-subtitle2 text-secondary">Soles a Yuanes</div>
            <div class="text-h6 q-mt-sm text-secondary">Tipo de cambio</div>
            <div class="text-h4 text-primary q-mt-xs">{{ formatoTipoCambio(rates.cny) }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="q-mt-xl">
      <q-card flat bordered class="dashboard-card">
        <q-card-section class="row items-center justify-between">
          <div>
            <div class="text-subtitle2 text-secondary">Movimiento del tipo de cambio PEN → USD</div>
            <div class="text-grey-7">Últimos {{ chartData.length }} días</div>
          </div>
          <div v-if="chartLoading">
            <q-spinner-dots color="primary" size="30px" />
          </div>
        </q-card-section>

        <q-separator style="background-color: rgba(252, 213, 53, 0.1)" />

        <q-card-section>
          <div class="q-mb-md chart-container">
            <canvas
              ref="chartCanvas"
              class="full-width chart-canvas"
              @mousemove="handleChartHover"
              @mouseleave="handleChartLeave"
            />

            <div
              v-if="hoveredPoint"
              class="chart-crosshair"
              :style="{ left: `${hoveredPoint.x}px` }"
            ></div>

            <div
              v-if="hoveredPoint"
              class="chart-tooltip"
              :style="{
                left: `${hoveredPoint.x}px`,
                top: `${hoveredPoint.y - 15}px`,
              }"
            >
              <div class="tooltip-date">{{ hoveredPoint.date }}</div>
              <div class="tooltip-rate">USD: {{ formatoTipoCambio(hoveredPoint.rate) }}</div>
            </div>
          </div>
          <div class="row q-col-gutter-lg q-mt-md simulator-section">
            <div class="col-12 col-md-4">
              <label class="text-subtitle2 text-secondary">Moneda origen</label>
              <q-input
                v-model.number="simulatorData.pen"
                type="number"
                outlined
                dense
                class="q-mt-xs sim-input"
                placeholder="0.00"
                @update:model-value="calculateSimulator"
              >
                <template v-slot:append>
                  <span class="text-primary text-subtitle2 text-weight-bold sim-append">PEN</span>
                </template>
              </q-input>
            </div>

            <div class="col-12 col-md-8">
              <label class="text-subtitle2 text-grey-8">Moneda destino</label>
              <div class="row q-col-gutter-md q-mt-none simulator-dest-row">
                <div class="col-12 col-md-4">
                  <q-input
                    :model-value="simulatorData.usd"
                    type="number"
                    outlined
                    dense
                    readonly
                    class="sim-input readonly-input"
                  >
                    <template v-slot:append>
                      <span class="text-primary text-subtitle2 text-weight-bold sim-append"
                        >USD</span
                      >
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    :model-value="simulatorData.eur"
                    type="number"
                    outlined
                    dense
                    readonly
                    class="sim-input readonly-input"
                  >
                    <template v-slot:append>
                      <span class="text-primary text-subtitle2 text-weight-bold sim-append"
                        >EUR</span
                      >
                    </template>
                  </q-input>
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    :model-value="simulatorData.cny"
                    type="number"
                    outlined
                    dense
                    readonly
                    class="sim-input readonly-input"
                  >
                    <template v-slot:append>
                      <span class="text-primary text-subtitle2 text-weight-bold sim-append"
                        >CNY</span
                      >
                    </template>
                  </q-input>
                </div>
              </div>
            </div>
          </div>

          <div class="q-mt-md text-center">
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-md-4">
                <div class="text-grey-7">1 PEN = {{ formatoTipoCambio(rates.usd) }} USD</div>
              </div>
              <div class="col-12 col-md-4">
                <div class="text-grey-7">1 PEN = {{ formatoTipoCambio(rates.eur) }} EUR</div>
              </div>
              <div class="col-12 col-md-4">
                <div class="text-grey-7">1 PEN = {{ formatoTipoCambio(rates.cny) }} CNY</div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { fetchExchangeRates, fetchUsdRateHistory } from 'src/services/exchange.service'

const userName = localStorage.getItem('userName') || 'Usuario'
const rates = ref({ usd: 3.5, eur: 3.88, cny: 0.5 })
const chartData = ref([])
const loading = ref(false)
const chartLoading = ref(false)
const chartError = ref('')
const chartCanvas = ref(null)
const simulatorData = ref({ pen: 100, usd: 0, eur: 0, cny: 0 })

watch(
  () => rates.value,
  () => {
    calculateSimulator()
  },
  { deep: true },
)

const calculateSimulator = () => {
  const pen = Number(simulatorData.value.pen) || 0
  if (pen <= 0) {
    simulatorData.value.usd = 0
    simulatorData.value.eur = 0
    simulatorData.value.cny = 0
    return
  }

  // Las tasas son unidades de moneda destino por 1 PEN (p. ej. 1 PEN = 0.26 USD)
  simulatorData.value.usd = rates.value.usd ? Number((pen / rates.value.usd).toFixed(2)) : 0
  simulatorData.value.eur = rates.value.eur ? Number((pen / rates.value.eur).toFixed(2)) : 0
  simulatorData.value.cny = rates.value.cny ? Number((pen / rates.value.cny).toFixed(2)) : 0
}

const hoveredPoint = ref(null)

const handleChartLeave = () => {
  hoveredPoint.value = null
}

const handleChartHover = (event) => {
  const canvas = chartCanvas.value
  if (!canvas || chartData.value.length === 0) return

  // Obtener posición del ratón relativa al Canvas
  const rect = canvas.getBoundingClientRect()
  const mouseX = event.clientX - rect.left

  // Mismos paddings que usas para dibujar
  const padding = { top: 30, right: 24, bottom: 40, left: 56 }
  const width = canvas.width / (window.devicePixelRatio || 1)
  const height = canvas.height / (window.devicePixelRatio || 1)
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom

  // Solo interactuar si el ratón está dentro del área de dibujo
  if (mouseX >= padding.left && mouseX <= width - padding.right) {
    const relativeX = mouseX - padding.left

    // Encontrar el índice del dato más cercano
    let pointIndex = Math.round((relativeX / plotWidth) * (chartData.value.length - 1))
    pointIndex = Math.max(0, Math.min(pointIndex, chartData.value.length - 1)) // Asegurar límites

    const point = chartData.value[pointIndex]

    // Calcular la posición X e Y exacta en el Canvas (Efecto imán)
    const values = chartData.value.map((item) => item.rate)
    const minValue = Math.min(...values)
    const maxValue = Math.max(...values)
    const valueRange = maxValue - minValue || 1

    const exactX = padding.left + (plotWidth * pointIndex) / Math.max(chartData.value.length - 1, 1)
    const exactY = padding.top + ((maxValue - point.rate) / valueRange) * plotHeight

    hoveredPoint.value = {
      date: point.date,
      rate: point.rate,
      x: exactX,
      y: exactY,
    }
  } else {
    hoveredPoint.value = null
  }
}

const formatoTipoCambio = (value) => {
  return value ? value.toFixed(4) : '-'
}

const drawChart = () => {
  const canvas = chartCanvas.value
  if (!canvas || chartData.value.length === 0) {
    return
  }

  const ctx = canvas.getContext('2d')
  const dpr = window.devicePixelRatio || 1
  const width = 1100
  const height = 360

  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, width, height)

  const padding = { top: 30, right: 24, bottom: 40, left: 56 }
  const plotWidth = width - padding.left - padding.right
  const plotHeight = height - padding.top - padding.bottom

  const values = chartData.value.map((item) => item.rate)
  const minValue = Math.min(...values)
  const maxValue = Math.max(...values)
  const valueRange = maxValue - minValue || 1
  const gridLines = 6

  // Dibujar líneas de grid
  ctx.font = '12px Inter, sans-serif'
  ctx.lineWidth = 1
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
  ctx.fillStyle = '#9aa4b5'

  for (let i = 0; i <= gridLines; i += 1) {
    const y = padding.top + (plotHeight / gridLines) * i
    ctx.beginPath()
    ctx.moveTo(padding.left, y)
    ctx.lineTo(width - padding.right, y)
    ctx.stroke()

    const valueLabel = (maxValue - (valueRange / gridLines) * i).toFixed(4)
    ctx.fillText(valueLabel, 8, y + 4)
  }

  // Dibujar ejes
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(padding.left, padding.top)
  ctx.lineTo(padding.left, height - padding.bottom)
  ctx.lineTo(width - padding.right, height - padding.bottom)
  ctx.stroke()

  // Calcular puntos para la curva suave (Catmull-Rom spline)
  const points = chartData.value.map((item, index) => {
    const x = padding.left + (plotWidth * index) / Math.max(chartData.value.length - 1, 1)
    const y = padding.top + ((maxValue - item.rate) / valueRange) * plotHeight
    return { x, y }
  })

  // Dibujar curva suave usando quadraticCurve
  ctx.strokeStyle = '#f0b90b'
  ctx.lineWidth = 2.5
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)

  for (let i = 1; i < points.length; i++) {
    const xc = (points[i].x + points[i - 1].x) / 2
    const yc = (points[i].y + points[i - 1].y) / 2
    ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc)
  }
  ctx.quadraticCurveTo(
    points[points.length - 1].x,
    points[points.length - 1].y,
    points[points.length - 1].x,
    points[points.length - 1].y,
  )
  ctx.stroke()

  // Dibujar área bajo la curva
  ctx.fillStyle = 'rgba(240, 185, 11, 0.18)'
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)

  for (let i = 1; i < points.length; i++) {
    const xc = (points[i].x + points[i - 1].x) / 2
    const yc = (points[i].y + points[i - 1].y) / 2
    ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc)
  }
  ctx.quadraticCurveTo(
    points[points.length - 1].x,
    points[points.length - 1].y,
    points[points.length - 1].x,
    points[points.length - 1].y,
  )
  ctx.lineTo(width - padding.right, height - padding.bottom)
  ctx.lineTo(padding.left, height - padding.bottom)
  ctx.closePath()
  ctx.fill()

  // Dibujar puntos en cada dato
  ctx.fillStyle = '#f0b90b'
  points.forEach((point) => {
    ctx.beginPath()
    ctx.arc(point.x, point.y, 3, 0, Math.PI * 2)
    ctx.fill()
  })

  // Dibujar etiquetas de fechas
  ctx.fillStyle = '#9aa4b5'
  ctx.textAlign = 'center'

  const labelStep = Math.max(1, Math.floor(chartData.value.length / 6))
  chartData.value.forEach((item, index) => {
    if (index % labelStep !== 0 && index !== chartData.value.length - 1) {
      return
    }
    const x = padding.left + (plotWidth * index) / Math.max(chartData.value.length - 1, 1)
    const y = height - padding.bottom + 18
    ctx.fillText(item.date.slice(5), x, y)
  })
}

const loadExchangeData = async () => {
  try {
    loading.value = true
    chartLoading.value = true
    chartError.value = ''

    const [latestRates, usdHistory] = await Promise.all([
      fetchExchangeRates(),
      fetchUsdRateHistory(30),
    ])

    rates.value = latestRates
    chartData.value = usdHistory
    await nextTick()
    drawChart()
  } catch (error) {
    chartError.value = 'No se pudo cargar la información del tipo de cambio.'
    console.error(error)
  } finally {
    loading.value = false
    chartLoading.value = false
  }
}

onMounted(loadExchangeData)
</script>

<style scoped>
.dashboard-card {
  background-color: #1e2329;
  border-color: rgba(252, 213, 53, 0.1);
}

.input-dark {
  background-color: rgba(30, 35, 41, 0.8);
}

.input-dark :deep(.q-field__control) {
  color: #eaecef;
}

.text-secondary {
  color: #848e9c;
}

.chart-canvas {
  width: 100%;
  max-width: 100%;
  min-height: 360px;
  cursor: crosshair;
}

.chart-container {
  position: relative;
}

.chart-canvas {
  width: 100%;
  max-width: 100%;
  min-height: 360px;
  cursor: crosshair;
}

.chart-crosshair {
  position: absolute;
  top: 30px;
  bottom: 40px;
  width: 1px;
  background-color: rgba(240, 185, 11, 0.35);
  pointer-events: none;
  z-index: 10;
  transform: translateX(-50%);
}

.chart-tooltip {
  position: absolute;
  background-color: rgba(9, 12, 22, 0.96);
  color: #e5e8ee;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
  pointer-events: none;
  z-index: 1000;
  white-space: nowrap;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.24);
  transform: translate(-50%, -100%);
  transition:
    top 0.1s ease,
    left 0.1s ease;
}

.tooltip-date {
  font-weight: 500;
  margin-bottom: 4px;
  font-size: 11px;
  color: #9aa4b5;
}

.tooltip-rate {
  color: #f0b90b;
  font-weight: 700;
  font-size: 14px;
}

.chart-legend {
  color: #c8d1e0;
}

.chart-legend span {
  color: #9aa4b5;
}
</style>
