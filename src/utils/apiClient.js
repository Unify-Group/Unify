import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
})

export const extractErrorMessage = (error) => {
  const payload = error?.response?.data || {}
  return (
    payload?.error?.message ||
    payload?.message ||
    payload?.error ||
    error?.message ||
    'Request failed'
  )
}
