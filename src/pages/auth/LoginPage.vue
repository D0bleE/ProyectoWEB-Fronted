<template>
  <q-page class="auth-page flex flex-center">
    <q-card class="auth-card q-pa-xl shadow-10">
      <div class="text-h4 text-center text-primary text-weight-bold">P2P Divisas</div>

      <div class="text-grey-7 text-center q-mb-lg">Inicia sesión para continuar</div>

      <LoginForm />
    </q-card>
  </q-page>
</template>

<script setup>
import LoginForm from 'src/components/auth/LoginForm.vue'
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  background: #f4f6f8;
}

.auth-card {
  width: 400px;
  max-width: 92vw;
  border-radius: 22px;
}
</style>
