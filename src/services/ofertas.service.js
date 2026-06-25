import { api } from 'boot/axios'

export const obtenerMercado = async () => {
  const response = await api.get('/Ofertas/mercado')
  return response.data
}

export const buscarOfertas = async (tengoMonedaId, quieroMonedaId) => {
  const response = await api.get(
    `/Ofertas/buscar?tengoMonedaId=${tengoMonedaId}&quieroMonedaId=${quieroMonedaId}`,
  )
  return response.data
}

export const crearOferta = async (data) => {
  const response = await api.post('/Ofertas/crear', data)
  return response.data
}

export const cancelarOferta = async (id) => {
  const response = await api.post(`/Ofertas/cancelar/${id}`)
  return response.data
}

export const aceptarOferta = async (id, data) => {
  const response = await api.post(`/Ofertas/aceptar/${id}`, data)
  return response.data
}
