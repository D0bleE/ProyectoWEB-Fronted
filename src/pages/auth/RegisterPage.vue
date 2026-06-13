<template>
  <q-page class="auth-page flex flex-center">
    <q-card class="auth-card q-pa-xl shadow-10">
      <div class="text-h4 text-center text-primary text-weight-bold">Crear cuenta</div>

      <div class="text-grey-7 text-center q-mb-lg">Regístrate para acceder a P2P Divisas</div>

      <RegisterForm />
    </q-card>
  </q-page>
</template>

<script setup>
import RegisterForm from 'src/components/auth/RegisterForm.vue'
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: #f4f6f8;
}

.auth-card {
  width: 440px;
  max-width: 92vw;
  border-radius: 22px;
}
</style>
