<template>
  <q-page class="q-pa-lg">
    <div class="text-h4 text-primary">Bienvenido, {{ userName }} 👋</div>

    <div class="text-grey-7 q-mt-sm">Plataforma P2P de cambio de divisas.</div>
  </q-page>
</template>

<script setup>
const userName = localStorage.getItem('userName') || 'Usuario'
</script>
