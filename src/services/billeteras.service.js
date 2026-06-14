import { api } from 'boot/axios'

export const obtenerSaldosPorUsuario = async (usuarioId) => {
  const response = await api.get(`/Billeteras/saldos/${usuarioId}`)
  return response.data
}

export const crearBilletera = async (data) => {
  const response = await api.post('/Billeteras/crear', data)
  return response.data
}
