<template>
  <q-page class="q-pa-lg">
    <div class="row justify-between items-center q-mb-md">
      <div>
        <div class="text-h4 text-primary">Cuentas bancarias</div>
        <div class="text-grey-7">Registra y consulta tus cuentas para realizar retiros.</div>
      </div>

      <q-btn color="primary" icon="add" label="Registrar cuenta" @click="abrirModal" />
    </div>

    <div v-if="loading" class="row justify-center q-pa-xl">
      <q-spinner color="primary" size="40px" />
    </div>

    <div v-else class="row q-col-gutter-md">
      <div v-for="cuenta in cuentas" :key="cuenta.id" class="col-12 col-sm-6 col-md-4">
        <q-card class="q-pa-md cuenta-card">
          <div class="row items-center justify-between">
            <div>
              <div class="text-h6">{{ cuenta.banco }}</div>
              <div class="text-grey-7">{{ cuenta.monedaCodigo }} - {{ cuenta.monedaSimbolo }}</div>
            </div>

            <q-icon name="account_balance" color="primary" size="34px" />
          </div>

          <q-separator class="q-my-md" />

          <div class="text-caption text-grey-7">Titular</div>
          <div class="q-mb-sm text-weight-medium">
            {{ cuenta.titularNombre }}
          </div>

          <div class="text-caption text-grey-7">Número de cuenta</div>
          <div class="q-mb-sm">
            {{ formatearNumeroCuenta(cuenta.numeroCuenta) }}
          </div>

          <div class="text-caption text-grey-7">CCI</div>
          <div>
            {{ formatearCCI(cuenta.numeroCCI) }}
          </div>
        </q-card>
      </div>
    </div>

    <q-banner
      v-if="!loading && cuentas.length === 0"
      class="bg-grey-2 text-grey-8 q-mt-md rounded-borders"
    >
      No tienes cuentas bancarias registradas.
    </q-banner>

    <q-dialog v-model="modal" persistent>
      <q-card style="width: 480px; max-width: 92vw">
        <q-card-section>
          <div class="text-h6">Registrar cuenta bancaria</div>
          <div class="text-grey-7">Completa correctamente todos los datos de tu cuenta.</div>
        </q-card-section>

        <q-separator />

        <q-card-section>
          <q-input
            outlined
            v-model.trim="form.banco"
            label="Banco"
            maxlength="80"
            counter
            :error="bancoTocado && !bancoValido"
            error-message="Ingresa el nombre del banco."
            class="q-mb-md"
            @blur="bancoTocado = true"
          >
            <template #prepend>
              <q-icon name="account_balance" />
            </template>
          </q-input>

          <q-input
            outlined
            v-model.trim="form.titularNombre"
            label="Nombre del titular"
            maxlength="150"
            counter
            :error="titularTocado && !titularValido"
            error-message="Ingresa el nombre completo del titular."
            class="q-mb-md"
            @blur="titularTocado = true"
          >
            <template #prepend>
              <q-icon name="person" />
            </template>
          </q-input>

          <q-input
            outlined
            v-model="form.numeroCuenta"
            label="Número de cuenta"
            mask="###################"
            unmasked-value
            maxlength="19"
            counter
            hint="Solo números. Máximo 19 dígitos."
            :error="numeroCuentaTocado && !numeroCuentaValido"
            error-message="Ingresa entre 1 y 19 dígitos."
            class="q-mb-md"
            @blur="numeroCuentaTocado = true"
          >
            <template #prepend>
              <q-icon name="credit_card" />
            </template>
          </q-input>

          <q-input
            outlined
            v-model="form.numeroCCI"
            label="Código de cuenta interbancario (CCI)"
            mask="###-###-############-##"
            unmasked-value
            maxlength="23"
            counter
            hint="El CCI debe contener exactamente 20 dígitos."
            :error="cciTocado && !cciValido"
            error-message="El CCI debe tener exactamente 20 dígitos."
            class="q-mb-md"
            @blur="cciTocado = true"
          >
            <template #prepend>
              <q-icon name="numbers" />
            </template>
          </q-input>

          <q-select
            outlined
            v-model="form.monedaId"
            :options="monedasOptions"
            option-label="label"
            option-value="id"
            emit-value
            map-options
            label="Moneda de la cuenta"
            :loading="loadingMonedas"
            :disable="loadingMonedas"
            :error="monedaTocada && !monedaValida"
            error-message="Selecciona una moneda."
            @blur="monedaTocada = true"
          >
            <template #prepend>
              <q-icon name="paid" />
            </template>

            <template #no-option>
              <q-item>
                <q-item-section class="text-grey">
                  No hay monedas activas disponibles.
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-banner v-if="errorModal" class="bg-red-1 text-negative q-mt-md rounded-borders">
            {{ errorModal }}
          </q-banner>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-7" :disable="saving" @click="cerrarModal" />

          <q-btn
            color="primary"
            icon="save"
            label="Guardar"
            :loading="saving"
            :disable="!formularioValido || saving"
            @click="guardarCuenta"
          >
            <q-tooltip v-if="!formularioValido">
              Completa correctamente todos los campos.
            </q-tooltip>
          </q-btn>
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
import { obtenerCuentasPorUsuario, registrarCuentaBancaria } from 'src/services/cuentas.service'
import { obtenerMonedasActivas } from 'src/services/monedas.service'

const cuentas = ref([])
const monedas = ref([])

const loading = ref(false)
const loadingMonedas = ref(false)
const saving = ref(false)
const modal = ref(false)

const message = ref('')
const errorMessage = ref('')
const errorModal = ref('')

const bancoTocado = ref(false)
const titularTocado = ref(false)
const numeroCuentaTocado = ref(false)
const cciTocado = ref(false)
const monedaTocada = ref(false)

const usuarioId = Number(localStorage.getItem('userId'))
const userName = localStorage.getItem('userName') || ''

const form = ref({
  banco: '',
  titularNombre: '',
  numeroCuenta: '',
  numeroCCI: '',
  monedaId: null,
})

const bancoValido = computed(() => {
  return form.value.banco.trim().length >= 2
})

const titularValido = computed(() => {
  return form.value.titularNombre.trim().length >= 3
})

const numeroCuentaValido = computed(() => {
  const numero = String(form.value.numeroCuenta || '')

  return /^\d{1,19}$/.test(numero)
})

const cciValido = computed(() => {
  const cci = String(form.value.numeroCCI || '')

  return /^\d{20}$/.test(cci)
})

const monedaValida = computed(() => {
  return Number(form.value.monedaId) > 0
})

const formularioValido = computed(() => {
  return (
    bancoValido.value &&
    titularValido.value &&
    numeroCuentaValido.value &&
    cciValido.value &&
    monedaValida.value
  )
})

const monedasOptions = computed(() =>
  monedas.value.map((moneda) => ({
    id: moneda.id,
    label: `${moneda.codigoIso} - ${moneda.nombre}`,
  })),
)

const limpiarValidaciones = () => {
  bancoTocado.value = false
  titularTocado.value = false
  numeroCuentaTocado.value = false
  cciTocado.value = false
  monedaTocada.value = false
  errorModal.value = ''
}

const limpiarFormulario = () => {
  form.value = {
    banco: '',
    titularNombre: userName,
    numeroCuenta: '',
    numeroCCI: '',
    monedaId: null,
  }

  limpiarValidaciones()
}

const cargarCuentas = async () => {
  try {
    loading.value = true
    errorMessage.value = ''

    cuentas.value = await obtenerCuentasPorUsuario(usuarioId)
  } catch (error) {
    console.error(error)
    errorMessage.value = 'No se pudieron cargar las cuentas bancarias.'
  } finally {
    loading.value = false
  }
}

const cargarMonedas = async () => {
  try {
    loadingMonedas.value = true
    errorModal.value = ''

    // Este servicio debe consumir el endpoint que devuelve solo monedas activas.
    monedas.value = await obtenerMonedasActivas()
  } catch (error) {
    console.error(error)
    monedas.value = []
    errorModal.value = 'No se pudieron cargar las monedas activas.'
  } finally {
    loadingMonedas.value = false
  }
}

const abrirModal = async () => {
  message.value = ''
  errorMessage.value = ''
  limpiarFormulario()

  modal.value = true
  await cargarMonedas()
}

const cerrarModal = () => {
  if (saving.value) return

  modal.value = false
  limpiarFormulario()
}

const marcarTodosLosCampos = () => {
  bancoTocado.value = true
  titularTocado.value = true
  numeroCuentaTocado.value = true
  cciTocado.value = true
  monedaTocada.value = true
}

const guardarCuenta = async () => {
  message.value = ''
  errorMessage.value = ''
  errorModal.value = ''

  marcarTodosLosCampos()

  if (!formularioValido.value) {
    errorModal.value = 'Revisa los campos antes de guardar la cuenta.'
    return
  }

  try {
    saving.value = true

    const response = await registrarCuentaBancaria({
      usuarioId,
      monedaId: Number(form.value.monedaId),
      banco: form.value.banco.trim(),
      titularNombre: form.value.titularNombre.trim(),
      numeroCuenta: String(form.value.numeroCuenta),
      numeroCCI: String(form.value.numeroCCI),
    })

    message.value = response.message || 'Cuenta bancaria registrada correctamente.'

    modal.value = false
    limpiarFormulario()

    await cargarCuentas()
  } catch (error) {
    console.error(error)

    errorModal.value = error.response?.data?.message || 'No se pudo registrar la cuenta bancaria.'
  } finally {
    saving.value = false
  }
}

const formatearNumeroCuenta = (numero) => {
  if (!numero) return '-'
  return String(numero)
}

const formatearCCI = (cci) => {
  const valor = String(cci || '').replace(/\D/g, '')

  if (valor.length !== 20) return cci || '-'

  return `${valor.slice(0, 3)}-${valor.slice(3, 6)}-${valor.slice(6, 18)}-${valor.slice(18, 20)}`
}

onMounted(() => {
  cargarCuentas()
})
</script>

<style scoped>
.cuenta-card {
  border-radius: 16px;
  min-height: 235px;
}
</style>
