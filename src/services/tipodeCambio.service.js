import { api } from 'boot/axios'

export const obtenerTipoCambioEnVivo = async (desde, hacia) => {
  const response = await api.get(`/TipoCambio/en-vivo?desde=${desde}&hacia=${hacia}`)
  return response.data
}
