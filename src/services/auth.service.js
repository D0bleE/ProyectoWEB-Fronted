import { api } from 'boot/axios'

export const login = async (credentials) => {
  const response = await api.post('/Auth/login', credentials)
  return response.data
}
export const register = async (data) => {
  const response = await api.post('/Auth/register', data)
  return response.data
}
