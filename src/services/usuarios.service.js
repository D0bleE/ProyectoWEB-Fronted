import { api } from 'boot/axios'

export const obtenerUsuariosAdmin = async () => {
  const response = await api.get('/Usuarios/admin')
  return response.data
}

export const cambiarEstadoUsuario = async (usuarioId) => {
  const response = await api.post(`/Usuarios/cambiar-estado/${usuarioId}`)
  return response.data
}