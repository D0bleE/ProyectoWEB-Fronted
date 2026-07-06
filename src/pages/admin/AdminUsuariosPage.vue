<template>
  <q-page class="q-pa-lg">

    <div class="text-h4 text-primary">
      Gestión de Usuarios
    </div>

    <div class="text-grey-7 q-mb-lg">
      Administra los usuarios registrados en la plataforma.
    </div>

    <q-input
      outlined
      dense
      debounce="300"
      v-model="buscar"
      placeholder="Buscar usuario..."
      class="q-mb-lg"
    >
      <template #prepend>
        <q-icon name="search"/>
      </template>
    </q-input>

    <q-spinner
      v-if="loading"
      color="primary"
      size="45px"
    />

    <div
      v-else
      class="row q-col-gutter-lg"
    >

      <div
        v-for="usuario in usuariosFiltrados"
        :key="usuario.id"
        class="col-12 col-md-6 col-lg-4"
      >

        <q-card class="user-card">

          <q-card-section>

            <div class="row items-center">

              <q-avatar
                color="primary"
                text-color="white"
                size="60px"
              >
                {{ usuario.nombreCompleto.charAt(0) }}
              </q-avatar>

              <div class="q-ml-md">

                <div class="text-h6">
                  {{ usuario.nombreCompleto }}
                </div>

                <div class="text-grey">
                  {{ usuario.email }}
                </div>

              </div>

            </div>

            <q-separator class="q-my-md"/>

            <div class="row justify-between">

              <div>
                <strong>Rol</strong><br>
                {{ usuario.rol }}
              </div>

              <q-badge
                :color="usuario.activo ? 'positive' : 'negative'"
              >
                {{ usuario.activo ? 'Activo' : 'Deshabilitado' }}
              </q-badge>

            </div>

            <div class="q-mt-md">

              <div class="row items-center">

                <q-rating
                  readonly
                  color="amber"
                  :model-value="usuario.calificacionPromedio"
                  max="5"
                  size="20px"
                />

                <span class="q-ml-sm">
                  {{ usuario.calificacionPromedio.toFixed(1) }}
                </span>

              </div>

            </div>

            <q-separator class="q-my-md"/>

            <div class="row justify-between">

              <div>

                <div class="text-caption">
                  Movimientos
                </div>

                <div class="text-h6">
                  {{ usuario.totalMovimientos }}
                </div>

              </div>

              <div>

                <div class="text-caption">
                  Ofertas
                </div>

                <div class="text-h6">
                  {{ usuario.totalOfertas }}
                </div>

              </div>

              <div>

                <div class="text-caption">
                  P2P
                </div>

                <div class="text-h6">
                  {{ usuario.totalOperacionesP2P }}
                </div>

              </div>

            </div>

          </q-card-section>

          <q-card-actions align="right">

            <q-btn
              flat
              color="primary"
              icon="visibility"
              label="Ver perfil"
              @click="abrirPerfil(usuario)"
            />

            <q-btn
              :color="usuario.activo ? 'negative' : 'positive'"
              :label="usuario.activo ? 'Deshabilitar' : 'Activar'"
              @click="cambiarEstado(usuario)"
            />

          </q-card-actions>

        </q-card>

      </div>

    </div>
<q-dialog v-model="dialogPerfil">
  <q-card class="profile-card">
    <q-card-section class="text-center">
      <q-avatar color="primary" text-color="white" size="90px">
        {{ usuarioSeleccionado?.nombreCompleto?.charAt(0) }}
      </q-avatar>

      <div class="text-h5 q-mt-md">
        {{ usuarioSeleccionado?.nombreCompleto }}
      </div>

      <div class="text-grey-7">
        {{ usuarioSeleccionado?.email }}
      </div>

      <q-rating
        readonly
        color="amber"
        :model-value="usuarioSeleccionado?.calificacionPromedio || 0"
        max="5"
        size="28px"
        class="q-mt-sm"
      />

      <div class="text-caption text-grey-7">
        {{ Number(usuarioSeleccionado?.calificacionPromedio || 0).toFixed(1) }}
        / 5.0
      </div>
    </q-card-section>

    <q-separator />

    <q-card-section>
      <div class="row q-col-gutter-md text-center">
        <div class="col-4">
          <div class="text-h5 text-primary">
            {{ usuarioSeleccionado?.totalMovimientos }}
          </div>
          <div class="text-caption">Movimientos</div>
        </div>

        <div class="col-4">
          <div class="text-h5 text-teal">
            {{ usuarioSeleccionado?.totalOfertas }}
          </div>
          <div class="text-caption">Ofertas</div>
        </div>

        <div class="col-4">
          <div class="text-h5 text-purple">
            {{ usuarioSeleccionado?.totalOperacionesP2P }}
          </div>
          <div class="text-caption">P2P</div>
        </div>
      </div>

      <q-separator class="q-my-md" />

      <div class="q-mb-sm">
        <strong>Rol:</strong> {{ usuarioSeleccionado?.rol }}
      </div>

      <div class="q-mb-sm">
        <strong>Estado:</strong>
        <q-badge :color="usuarioSeleccionado?.activo ? 'positive' : 'negative'">
          {{ usuarioSeleccionado?.activo ? 'Activo' : 'Deshabilitado' }}
        </q-badge>
      </div>

      <div class="q-mb-sm">
        <strong>Registro:</strong> {{ usuarioSeleccionado?.fechaRegistro }}
      </div>

      <q-linear-progress
        :value="nivelActividad"
        color="primary"
        size="12px"
        rounded
        class="q-mt-md"
      />
      <div class="text-caption text-grey-7 q-mt-xs">
        Nivel de actividad
      </div>
    </q-card-section>

    <q-card-actions align="between">
      <q-btn flat label="Cerrar" color="grey-7" v-close-popup />

      <q-btn
        :color="usuarioSeleccionado?.activo ? 'negative' : 'positive'"
        :label="usuarioSeleccionado?.activo ? 'Deshabilitar' : 'Activar'"
        @click="cambiarEstadoDesdePerfil"
      />
    </q-card-actions>
  </q-card>
</q-dialog>
  </q-page>
</template>

<script setup>

import {ref,computed,onMounted} from 'vue'
import {obtenerUsuariosAdmin,cambiarEstadoUsuario} from 'src/services/usuarios.service'

const usuarios=ref([])
const loading=ref(false)

const buscar=ref('')

const usuarioSeleccionado=ref(null)
const dialogPerfil = ref(false)

const abrirPerfil = (usuario) => {
  usuarioSeleccionado.value = usuario
  dialogPerfil.value = true
}

const nivelActividad = computed(() => {
  if (!usuarioSeleccionado.value) return 0

  const total =
    usuarioSeleccionado.value.totalMovimientos +
    usuarioSeleccionado.value.totalOfertas +
    usuarioSeleccionado.value.totalOperacionesP2P

  return Math.min(total / 20, 1)
})

const cambiarEstadoDesdePerfil = async () => {
  if (!usuarioSeleccionado.value) return

  await cambiarEstadoUsuario(usuarioSeleccionado.value.id)
  await cargarUsuarios()

  const actualizado = usuarios.value.find((u) => u.id === usuarioSeleccionado.value.id)
  usuarioSeleccionado.value = actualizado
}

const usuariosFiltrados=computed(()=>{

return usuarios.value.filter(u=>

u.nombreCompleto.toLowerCase().includes(buscar.value.toLowerCase()) ||

u.email.toLowerCase().includes(buscar.value.toLowerCase())

)

})

const cargarUsuarios=async()=>{

loading.value=true

usuarios.value=await obtenerUsuariosAdmin()

loading.value=false

}

const cambiarEstado=async(usuario)=>{

await cambiarEstadoUsuario(usuario.id)

await cargarUsuarios()

}

onMounted(()=>{

cargarUsuarios()

})

</script>

<style scoped>
.profile-card {
  width: 430px;
  max-width: 95vw;
  border-radius: 22px;
}
.user-card{

border-radius:18px;

transition:.25s;

}

.user-card:hover{

transform:translateY(-6px);

}

</style>