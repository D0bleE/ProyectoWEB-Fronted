<template>
  <q-form @submit.prevent="handleRegister">
    <q-input outlined v-model.trim="nombreCompleto" label="Nombre completo" class="q-mb-md" />

    <q-input
      outlined
      v-model.trim="email"
      label="Correo electrónico"
      type="email"
      class="q-mb-md"
    />

    <q-input
      outlined
      v-model="password"
      label="Contraseña"
      :type="showPassword ? 'text' : 'password'"
      class="q-mb-sm"
    >
      <template #append>
        <q-icon
          :name="showPassword ? 'visibility_off' : 'visibility'"
          class="cursor-pointer"
          @click="showPassword = !showPassword"
        />
      </template>
    </q-input>

    <div class="password-rules q-mb-md">
      <div :class="password.length >= 8 ? 'text-positive' : 'text-grey-6'">
        ✓ Mínimo 8 caracteres
      </div>
      <div :class="/[A-Z]/.test(password) ? 'text-positive' : 'text-grey-6'">
        ✓ Una letra mayúscula
      </div>
      <div :class="/[a-z]/.test(password) ? 'text-positive' : 'text-grey-6'">
        ✓ Una letra minúscula
      </div>
      <div :class="/[0-9]/.test(password) ? 'text-positive' : 'text-grey-6'">✓ Un número</div>
      <div :class="/[^A-Za-z0-9]/.test(password) ? 'text-positive' : 'text-grey-6'">
        ✓ Un carácter especial
      </div>
    </div>

    <q-input
      outlined
      v-model="confirmarPassword"
      label="Confirmar contraseña"
      :type="showConfirmPassword ? 'text' : 'password'"
      class="q-mb-md"
    >
      <template #append>
        <q-icon
          :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
          class="cursor-pointer"
          @click="showConfirmPassword = !showConfirmPassword"
        />
      </template>
    </q-input>

    <q-btn
      label="Crear cuenta"
      color="primary"
      unelevated
      class="full-width"
      type="submit"
      :loading="loading"
    />

    <q-btn
      flat
      label="Ya tengo una cuenta"
      color="primary"
      class="full-width q-mt-sm"
      @click="router.push('/login')"
    />

    <q-banner v-if="errorMessage" class="bg-red-1 q-mt-md rounded-borders">
      <div class="text-negative text-center">
        {{ errorMessage }}
      </div>
    </q-banner>

    <q-banner v-if="successMessage" class="bg-green-1 q-mt-md rounded-borders">
      <div class="text-positive text-center">
        {{ successMessage }}
      </div>
    </q-banner>
  </q-form>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { register } from 'src/services/auth.service'

const router = useRouter()

const nombreCompleto = ref('')
const email = ref('')
const password = ref('')
const confirmarPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const loading = ref(false)

const isEmailValid = computed(() => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
})

const isPasswordValid = computed(() => {
  return (
    password.value.length >= 8 &&
    /[A-Z]/.test(password.value) &&
    /[a-z]/.test(password.value) &&
    /[0-9]/.test(password.value) &&
    /[^A-Za-z0-9]/.test(password.value)
  )
})

const handleRegister = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!nombreCompleto.value || !email.value || !password.value || !confirmarPassword.value) {
    errorMessage.value = 'Completa todos los campos para continuar.'
    return
  }

  if (!isEmailValid.value) {
    errorMessage.value = 'Ingresa un correo electrónico válido.'
    return
  }

  if (!isPasswordValid.value) {
    errorMessage.value = 'La contraseña no cumple con los requisitos de seguridad.'
    return
  }

  if (password.value !== confirmarPassword.value) {
    errorMessage.value = 'Las contraseñas no coinciden.'
    return
  }

  try {
    loading.value = true

    const response = await register({
      nombreCompleto: nombreCompleto.value,
      email: email.value,
      password: password.value,
      confirmarPassword: confirmarPassword.value,
    })

    successMessage.value = response.message || 'Cuenta creada correctamente.'

    setTimeout(() => {
      router.push('/login')
    }, 1200)
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'No se pudo crear la cuenta.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.password-rules {
  font-size: 12px;
  line-height: 1.7;
}
</style>
