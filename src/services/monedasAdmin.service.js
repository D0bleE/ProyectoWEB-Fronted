import { api } from 'boot/axios'

export const obtenerMonedasAdmin = async () => {
  const response = await api.get('/MonedasAdmin')
  return response.data
}

export const cambiarEstadoMoneda = async (id) => {
  const response = await api.post(`/MonedasAdmin/cambiar-estado/${id}`)
  return response.data
}

export const crearMonedaAdmin = async (formData) => {
  const response = await api.post('/MonedasAdmin/crear', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}
