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
              <div class="text-h6">{{ billetera.monedaCodigo }}</div>
              <div class="text-grey-7">{{ billetera.monedaNombre }}</div>
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
            <q-btn
              color="primary"
              icon="add"
              label="Recargar"
              size="sm"
              @click="abrirRecarga(billetera)"
            />

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

    <q-dialog v-model="modalRecarga">
      <q-card style="width: 430px; max-width: 90vw">
        <q-card-section>
          <div class="text-h6">Solicitar recarga</div>
          <div class="text-grey-7">
            {{ billeteraSeleccionada?.monedaCodigo }} -
            {{ billeteraSeleccionada?.monedaNombre }}
          </div>
        </q-card-section>

        <q-card-section>
          <q-input
            outlined
            v-model.number="formRecarga.monto"
            label="Monto a recargar"
            type="number"
            class="q-mb-md"
          />

          <q-file
            outlined
            v-model="formRecarga.voucher"
            label="Subir voucher"
            accept=".jpg,.jpeg,.png,.pdf"
            class="q-mb-md"
            clearable
            use-chips
          >
            <template #prepend>
              <q-icon name="attach_file" />
            </template>
          </q-file>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />

          <q-btn
            color="primary"
            label="Enviar solicitud"
            :loading="savingRecarga"
            @click="guardarRecarga"
          />
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
import { onMounted, ref, toRaw } from 'vue'
import { obtenerSaldosPorUsuario } from 'src/services/billeteras.service'
import { solicitarRecarga } from 'src/services/movimientos.service'

const billeteras = ref([])
const loading = ref(false)
const errorMessage = ref('')
const message = ref('')

const modalRecarga = ref(false)
const savingRecarga = ref(false)
const billeteraSeleccionada = ref(null)

const formRecarga = ref({
  monto: null,
  voucher: null,
})

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

const abrirRecarga = (billetera) => {
  message.value = ''
  errorMessage.value = ''
  billeteraSeleccionada.value = billetera

  formRecarga.value = {
    monto: null,
    voucher: null,
  }

  modalRecarga.value = true
}

const guardarRecarga = async () => {
  message.value = ''
  errorMessage.value = ''

  if (!formRecarga.value.monto || formRecarga.value.monto <= 0) {
    errorMessage.value = 'El monto debe ser mayor a cero.'
    return
  }

  if (!formRecarga.value.voucher) {
    errorMessage.value = 'Adjunta el voucher de pago.'
    return
  }

  try {
    savingRecarga.value = true

    const formData = new FormData()

    const rawVoucher = toRaw(formRecarga.value.voucher)
    const voucherFile = Array.isArray(rawVoucher) ? rawVoucher[0] : rawVoucher

    formData.append('usuarioId', String(usuarioId))
    formData.append('monedaId', String(billeteraSeleccionada.value.monedaId))
    formData.append('monto', String(formRecarga.value.monto))
    formData.append('voucher', voucherFile, voucherFile.name)

    const response = await solicitarRecarga(formData)

    message.value = response.message || 'Solicitud enviada correctamente.'
    modalRecarga.value = false

    await cargarBilleteras()
  } catch (error) {
    console.error(error.response?.data || error)

    errorMessage.value =
      error.response?.data?.message ||
      error.response?.data?.errors?.voucher?.[0] ||
      'No se pudo solicitar la recarga.'
  } finally {
    savingRecarga.value = false
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
