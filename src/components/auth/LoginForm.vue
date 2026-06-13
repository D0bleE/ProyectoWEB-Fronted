<template>
  <q-form @submit.prevent="handleLogin">
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
      class="q-mb-md"
    >
      <template #append>
        <q-icon
          :name="showPassword ? 'visibility_off' : 'visibility'"
          class="cursor-pointer"
          @click="showPassword = !showPassword"
        />
      </template>
    </q-input>

    <q-btn
      label="Ingresar"
      color="primary"
      unelevated
      class="full-width"
      type="submit"
      :loading="loading"
    />

    <q-btn
      flat
      label="Crear cuenta"
      color="primary"
      class="full-width q-mt-sm"
      @click="router.push('/register')"
    />

    <q-banner v-if="errorMessage" class="bg-red-1 q-mt-md rounded-borders">
      <div class="text-negative text-center">
        {{ errorMessage }}
      </div>
    </q-banner>
  </q-form>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from 'src/services/auth.service'

const router = useRouter()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const errorMessage = ref('')
const loading = ref(false)

const handleLogin = async () => {
  errorMessage.value = ''

  if (!email.value || !password.value) {
    errorMessage.value = 'Ingresa tu correo y contraseña.'
    return
  }

  try {
    loading.value = true

    const response = await login({
      Email: email.value,
      Password: password.value,
    })

    localStorage.setItem('token', response.token)
    localStorage.setItem('userId', response.id)
    localStorage.setItem('userName', response.nombreCompleto)
    localStorage.setItem('userEmail', response.email)
    localStorage.setItem('userRole', response.rol)

    if (response.rol === 'ADM') {
      router.push('/admin')
    } else {
      router.push('/dashboard')
    }
  } catch (error) {
    errorMessage.value = error.response?.data?.message || 'No se pudo iniciar sesión.'
  } finally {
    loading.value = false
  }
}
</script>
