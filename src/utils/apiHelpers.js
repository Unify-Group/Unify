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
    const event = await apiClient.get(`/api/events/${eventId}`)
    const organizerId = event.data.organizer_id
    const organizer = await apiClient.get(`/api/users/${organizerId}`)
    return { ...event.data, organizer: organizer.data[0] }
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

export const getMyRsvp = async (eventId) => {
  try {
    const response = await apiClient.get(`/api/rsvps/${eventId}`, getAuthConfig())
    return response.data
  } catch (error) {
    throw new Error(extractErrorMessage(error))
  }
}

export const getAttendeeCount = async (eventId) => {
  try {
    const response = await apiClient.get(`/api/rsvps/${eventId}/count`)
    return response.data.count
  } catch (error) {
    throw new Error(extractErrorMessage(error))
  }
}

export const getEventAttendees = async (eventId) => {
  try {
    const response = await apiClient.get(`/api/rsvps/${eventId}/attendees`)
    return response.data
  } catch (error) {
    throw new Error(extractErrorMessage(error))
  }
}

export const createRsvp = async (eventId) => {
  try {
    const response = await apiClient.post(`/api/rsvps/${eventId}`, {}, getAuthConfig())
    return response.data
  } catch (error) {
    throw new Error(extractErrorMessage(error))
  }
}

export const deleteRsvp = async (eventId) => {
  try {
    await apiClient.delete(`/api/rsvps/${eventId}`, getAuthConfig())
  } catch (error) {
    throw new Error(extractErrorMessage(error))
  }
}
