<template>
  <q-page class="q-pa-lg">
    <div class="text-h4 text-primary q-mb-sm">Panel de Administración</div>

    <div class="text-grey-7 q-mb-lg">Supervisa las operaciones principales de P2P Divisas.</div>

    <div class="row q-col-gutter-md">
      <div class="col-12 col-md-4">
        <q-card class="admin-card">
          <q-card-section>
            <q-icon name="payments" size="36px" color="primary" />

            <div class="text-h6 q-mt-md">Movimientos</div>

            <div class="text-grey-7">Aprueba o rechaza recargas y retiros pendientes.</div>
          </q-card-section>

          <q-card-actions>
            <q-btn color="primary" label="Gestionar" to="/admin/movimientos" />
          </q-card-actions>
        </q-card>
      </div>
    </div>
  </q-page>
</template>

<style scoped>
.admin-card {
  border-radius: 16px;
}
</style>
