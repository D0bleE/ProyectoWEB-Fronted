<template>
  <q-page class="q-pa-lg">
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h4 text-primary">Gestión de Monedas</div>
        <div class="text-grey-7">
          Administra las divisas disponibles en la plataforma.
        </div>
      </div>

      <q-btn
        color="primary"
        icon="add"
        label="Nueva moneda"
        @click="abrirNuevaMoneda"
      />
    </div>

    <q-spinner v-if="loading" color="primary" size="40px" />

    <div v-else class="row q-col-gutter-lg">
      <div
        v-for="moneda in monedas"
        :key="moneda.id"
        class="col-12 col-md-4"
      >
        <q-card class="currency-card">
          <q-card-section>
            <div class="row items-center">
              <q-avatar size="58px">
                <img :src="obtenerRutaBandera(moneda.rutaBandera)" />
              </q-avatar>

              <div class="q-ml-md">
                <div class="text-h6">{{ moneda.codigoIso }}</div>
                <div class="text-grey-7">{{ moneda.nombre }}</div>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="row justify-between items-center">
              <div>
                <div class="text-caption text-grey-7">Símbolo</div>
                <div class="text-h6">{{ moneda.simbolo }}</div>
              </div>

              <q-chip
                :color="moneda.activo ? 'positive' : 'negative'"
                text-color="white"
              >
                {{ moneda.activo ? 'ACTIVA' : 'DESACTIVADA' }}
              </q-chip>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              :color="moneda.activo ? 'negative' : 'positive'"
              :label="moneda.activo ? 'Desactivar' : 'Activar'"
              :loading="processingId === moneda.id"
              @click="cambiarEstado(moneda.id)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </div>

    <q-banner
      v-if="!loading && monedas.length === 0"
      class="bg-grey-2 text-grey-8 q-mt-md rounded-borders"
    >
      No hay monedas registradas.
    </q-banner>

    <q-dialog v-model="dialogNueva">
      <q-card style="width: 520px; max-width: 95vw">
        <q-card-section>
          <div class="text-h6">Nueva moneda</div>
          <div class="text-grey-7">
            Registra una nueva divisa para la plataforma.
          </div>
        </q-card-section>

        <q-card-section>
          <q-input
            outlined
            v-model.trim="form.codigoIso"
            label="Código ISO"
            maxlength="3"
            hint="Ejemplo: USD, PEN, EUR"
            class="q-mb-md"
            @update:model-value="form.codigoIso = form.codigoIso.toUpperCase()"
          />

          <q-input
            outlined
            v-model.trim="form.nombre"
            label="Nombre de la moneda"
            hint="Ejemplo: Dólar Americano"
            class="q-mb-md"
          />

          <q-input
            outlined
            v-model.trim="form.simbolo"
            label="Símbolo"
            hint="Ejemplo: $, S/, €"
            class="q-mb-md"
          />

          <q-toggle
            v-model="form.activo"
            label="Crear moneda activa"
            color="positive"
            class="q-mb-md"
          />

          <q-file
            outlined
            v-model="form.bandera"
            label="Subir bandera"
            accept=".jpg,.jpeg,.png"
            clearable
            use-chips
            class="q-mb-md"
          >
            <template #prepend>
              <q-icon name="image" />
            </template>
          </q-file>

          <div v-if="previewBandera" class="text-center q-mt-md">
            <q-avatar size="80px">
              <img :src="previewBandera" />
            </q-avatar>
            <div class="text-caption text-grey-7 q-mt-sm">
              Vista previa
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="grey-7" v-close-popup />

          <q-btn
            color="primary"
            label="Guardar"
            :loading="loadingGuardar"
            :disable="!formularioValido"
            @click="guardarMoneda"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-banner
      v-if="message"
      class="bg-green-1 text-positive q-mt-md rounded-borders"
    >
      {{ message }}
    </q-banner>

    <q-banner
      v-if="errorMessage"
      class="bg-red-1 text-negative q-mt-md rounded-borders"
    >
      {{ errorMessage }}
    </q-banner>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import {
  obtenerMonedasAdmin,
  cambiarEstadoMoneda,
  crearMonedaAdmin,
} from 'src/services/monedasAdmin.service'

const apiBase = import.meta.env.VITE_API_URL?.replace('/api', '') || ''

const monedas = ref([])
const loading = ref(false)
const loadingGuardar = ref(false)
const processingId = ref(null)

const dialogNueva = ref(false)
const message = ref('')
const errorMessage = ref('')
const previewBandera = ref('')

const form = ref({
  codigoIso: '',
  nombre: '',
  simbolo: '',
  activo: true,
  bandera: null,
})

const formularioValido = computed(() => {
  return (
    form.value.codigoIso.length === 3 &&
    form.value.nombre.trim().length > 0 &&
    form.value.simbolo.trim().length > 0 &&
    form.value.bandera
  )
})

const obtenerRutaBandera = (ruta) => {
  if (!ruta) return ''
  if (ruta.startsWith('http')) return ruta
  return `${apiBase}${ruta}`
}

const cargar = async () => {
  try {
    loading.value = true
    monedas.value = await obtenerMonedasAdmin()
  } catch (error) {
    console.error(error)
    errorMessage.value = 'No se pudieron cargar las monedas.'
  } finally {
    loading.value = false
  }
}

const abrirNuevaMoneda = () => {
  message.value = ''
  errorMessage.value = ''
  previewBandera.value = ''

  form.value = {
    codigoIso: '',
    nombre: '',
    simbolo: '',
    activo: true,
    bandera: null,
  }

  dialogNueva.value = true
}

const cambiarEstado = async (id) => {
  try {
    processingId.value = id
    message.value = ''
    errorMessage.value = ''

    const response = await cambiarEstadoMoneda(id)
    message.value = response.message || 'Estado actualizado correctamente.'

    await cargar()
  } catch (error) {
    console.error(error)
    errorMessage.value =
      error.response?.data?.message || 'No se pudo cambiar el estado de la moneda.'
  } finally {
    processingId.value = null
  }
}

const guardarMoneda = async () => {
  message.value = ''
  errorMessage.value = ''

  if (!formularioValido.value) {
    errorMessage.value = 'Completa correctamente todos los campos.'
    return
  }

  try {
    loadingGuardar.value = true

    const formData = new FormData()
    formData.append('codigoIso', form.value.codigoIso.toUpperCase())
    formData.append('nombre', form.value.nombre)
    formData.append('simbolo', form.value.simbolo)
    formData.append('activo', String(form.value.activo))
    formData.append('bandera', form.value.bandera)

    const response = await crearMonedaAdmin(formData)

    message.value = response.message || 'Moneda creada correctamente.'
    dialogNueva.value = false

    await cargar()
  } catch (error) {
    console.error(error)
    errorMessage.value =
      error.response?.data?.message || 'No se pudo crear la moneda.'
  } finally {
    loadingGuardar.value = false
  }
}

watch(
  () => form.value.bandera,
  (archivo) => {
    if (previewBandera.value) {
      URL.revokeObjectURL(previewBandera.value)
    }

    previewBandera.value = archivo ? URL.createObjectURL(archivo) : ''
  },
)

onMounted(() => {
  cargar()
})
</script>

<style scoped>
.currency-card {
  border-radius: 18px;
  transition: 0.25s;
}

.currency-card:hover {
  transform: translateY(-4px);
}
</style>