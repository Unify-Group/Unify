import { apiClient, extractErrorMessage } from './apiClient.js'

export const fetchEvents = async () => {
  try {
    const response = await apiClient.get('/api/events')
    return response.data
  } catch (error) {
    throw new Error(extractErrorMessage(error))
  }
}

export const createEvent = async (eventData) => {
  try {
    const response = await apiClient.post('/api/events', eventData)
    return response.data
  } catch (error) {
    throw new Error(extractErrorMessage(error))
  }
}

export const fetchCategories = async () => {
  try {
    const response = await apiClient.get('/api/categories')
    return response.data
  } catch (error) {
    throw new Error(extractErrorMessage(error))
  }
}
