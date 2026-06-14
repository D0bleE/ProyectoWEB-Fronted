import { api } from 'boot/axios'

export const obtenerMonedasActivas = async () => {
  const response = await api.get('/Monedas/activas')
  return response.data
}
