import { api } from 'boot/axios'

export const solicitarRecarga = async (data) => {
  const response = await api.post('/MovimientosFondos/solicitar-recarga', data)
  return response.data
}

export const solicitarRetiro = async (data) => {
  const response = await api.post('/MovimientosFondos/solicitar-retiro', data)
  return response.data
}

export const obtenerSolicitudesPendientes = async () => {
  const response = await api.get('/MovimientosFondos/pendientes')
  return response.data
}

export const procesarSolicitud = async (id, accion) => {
  const response = await api.post(`/MovimientosFondos/procesar-solicitud/${id}?accion=${accion}`)
  return response.data
}
export const obtenerHistorialMovimientosAdmin = async () => {
  const response = await api.get('/MovimientosFondos/admin/historial')
  return response.data
}

export const obtenerMovimientosPorUsuario = async (usuarioId) => {
  const response = await api.get(`/MovimientosFondos/usuario/${usuarioId}`)
  return response.data
}
