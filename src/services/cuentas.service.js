import { api } from 'boot/axios'

export const obtenerCuentasPorUsuario = async (usuarioId) => {
  const response = await api.get(`/CuentasBancarias/usuario/${usuarioId}`)
  return response.data
}

export const registrarCuentaBancaria = async (data) => {
  const response = await api.post('/CuentasBancarias/registrar', data)
  return response.data
}
