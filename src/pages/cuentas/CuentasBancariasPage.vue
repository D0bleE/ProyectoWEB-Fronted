<template>
  <q-page class="q-pa-lg">
    <div class="row justify-between items-center q-mb-md">
      <div>
        <div class="text-h4 text-primary">Cuentas bancarias</div>
        <div class="text-grey-7">Registra y consulta tus cuentas para retiros y operaciones.</div>
      </div>

      <q-btn color="primary" icon="add" label="Registrar cuenta" @click="abrirModal" />
    </div>

    <q-spinner v-if="loading" color="primary" size="40px" />

    <div v-else class="row q-col-gutter-md">
      <div v-for="cuenta in cuentas" :key="cuenta.id" class="col-12 col-md-4">
        <q-card class="q-pa-md cuenta-card">
          <div class="text-h6">{{ cuenta.banco }}</div>
          <div class="text-grey-7 q-mb-md">
            {{ cuenta.monedaCodigo }} - {{ cuenta.monedaSimbolo }}
          </div>

          <div class="text-caption text-grey-7">Titular</div>
          <div class="q-mb-sm">{{ cuenta.titularNombre }}</div>

          <div class="text-caption text-grey-7">Número de cuenta</div>
          <div class="q-mb-sm">{{ cuenta.numeroCuenta }}</div>

          <div class="text-caption text-grey-7">CCI</div>
          <div>{{ cuenta.numeroCCI }}</div>
        </q-card>
      </div>
    </div>

    <q-banner
      v-if="!loading && cuentas.length === 0"
      class="bg-grey-2 text-grey-8 q-mt-md rounded-borders"
    >
      No tienes cuentas bancarias registradas.
    </q-banner>

    <q-dialog v-model="modal">
      <q-card style="width: 460px; max-width: 92vw">
        <q-card-section>
          <div class="text-h6">Registrar cuenta bancaria</div>
          <div class="text-grey-7">Completa los datos de tu cuenta.</div>
        </q-card-section>

        <q-card-section>
          <q-input outlined v-model.trim="form.banco" label="Banco" class="q-mb-md" />

          <q-input
            outlined
            v-model.trim="form.titularNombre"
            label="Nombre del titular"
            class="q-mb-md"
          />

          <q-input
            outlined
            v-model.trim="form.numeroCuenta"
            label="Número de cuenta"
            hint="Ejemplo: 000-0000000000"
            mask="###-##########"
            class="q-mb-md"
          />

          <q-input
            outlined
            v-model.trim="form.numeroCCI"
            label="Número de cuenta interbancario (CCI)"
            hint="Ejemplo: 000-000-000000000000-00"
            mask="###-###-############-##"
            class="q-mb-md"
          />

          <q-select
            outlined
            v-model="form.monedaId"
            :options="monedasOptions"
            option-label="label"
            option-value="id"
            emit-value
            map-options
            label="Moneda"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />
          <q-btn color="primary" label="Guardar" :loading="saving" @click="guardarCuenta" />
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
const saving = ref(false)
const modal = ref(false)
const message = ref('')
const errorMessage = ref('')

const usuarioId = localStorage.getItem('userId')
const userName = localStorage.getItem('userName') || ''

const form = ref({
  banco: '',
  titularNombre: '',
  numeroCuenta: '',
  numeroCCI: '',
  monedaId: null,
})

const monedasOptions = computed(() =>
  monedas.value.map((m) => ({
    id: m.id,
    label: `${m.codigoIso} - ${m.nombre}`,
  })),
)

const limpiarFormulario = () => {
  form.value = {
    banco: '',
    titularNombre: userName,
    numeroCuenta: '',
    numeroCCI: '',
    monedaId: null,
  }
}

const cargarCuentas = async () => {
  try {
    loading.value = true
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
    monedas.value = await obtenerMonedasActivas()
  } catch (error) {
    console.error(error)
    errorMessage.value = 'No se pudieron cargar las monedas.'
  }
}

const abrirModal = async () => {
  message.value = ''
  errorMessage.value = ''
  limpiarFormulario()
  await cargarMonedas()
  modal.value = true
}

const guardarCuenta = async () => {
  message.value = ''
  errorMessage.value = ''

  if (
    !form.value.banco ||
    !form.value.titularNombre ||
    !form.value.numeroCuenta ||
    !form.value.numeroCCI ||
    !form.value.monedaId
  ) {
    errorMessage.value = 'Completa todos los campos.'
    return
  }

  try {
    saving.value = true

    const response = await registrarCuentaBancaria({
      usuarioId: Number(usuarioId),
      monedaId: Number(form.value.monedaId),
      banco: form.value.banco,
      titularNombre: form.value.titularNombre,
      numeroCuenta: form.value.numeroCuenta,
      numeroCCI: form.value.numeroCCI,
    })

    message.value = response.message || 'Cuenta registrada correctamente.'
    modal.value = false

    await cargarCuentas()
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'No se pudo registrar la cuenta bancaria.'
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  cargarCuentas()
})
</script>

<style scoped>
.cuenta-card {
  border-radius: 16px;
}
</style>
