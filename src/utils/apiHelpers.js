import { apiClient, extractErrorMessage } from './apiClient.js'

export const createEvent = async (eventData) => {
  try {
    const response = await apiClient.post('/api/events', eventData)
    return response.data
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
