import { apiClient, extractErrorMessage } from './apiClient.js'
import { getSavedToken } from './authClient.js'

const getAuthConfig = () => {
  const token = getSavedToken()

  if (!token) {
    throw new Error('Authentication required')
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
}

export const createEvent = async (eventData) => {
  try {
    const response = await apiClient.post('/api/events', eventData, getAuthConfig())
    return response.data
  } catch (error) {
    throw new Error(extractErrorMessage(error))
  }
}

export const getEventById = async (eventId) => {
  try {
    const response = await apiClient.get(`/api/events/${eventId}`)
    return response.data
  } catch (error) {
    throw new Error(extractErrorMessage(error))
  }
}

export const updateEvent = async (eventId, eventData) => {
  try {
    const response = await apiClient.put(`/api/events/${eventId}`, eventData, getAuthConfig())
    return response.data
  } catch (error) {
    throw new Error(extractErrorMessage(error))
  }
}

export const deleteEvent = async (eventId) => {
  try {
    await apiClient.delete(`/api/events/${eventId}`, getAuthConfig())
  } catch (error) {
    throw new Error(extractErrorMessage(error))
  }
}

export const getEvents = async () => {
  try {
    const response = await apiClient.get('/api/events')
    return response.data
  } catch (error) {
    throw new Error(extractErrorMessage(error))
  }
}

export const getCategories = async () => {
  try {
    const response = await apiClient.get('/api/categories')
    return response.data
  } catch (error) {
    throw new Error(extractErrorMessage(error))
  }
}
