import { api } from 'boot/axios'

export const calificarOperacion = async (data) => {
  const response = await api.post('/Calificaciones', data)
  return response.data
}
