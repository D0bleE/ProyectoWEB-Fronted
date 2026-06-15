import { api } from 'boot/axios'

export const obtenerSaldosPorUsuario = async (usuarioId) => {
  const response = await api.get(`/Billeteras/saldos/${usuarioId}`)
  return response.data
}
