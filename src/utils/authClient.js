import { apiClient, extractErrorMessage } from './apiClient.js'

const TOKEN_KEY = 'unify_token'
const USER_KEY = 'unify_user'

const toJsonOrThrow = async (promise) => {
  try {
    const response = await promise
    return response.data
  } catch (error) {
    throw new Error(extractErrorMessage(error))
  }
}

export const signup = async ({ first_name, last_name, email, password }) => {
  return toJsonOrThrow(
    apiClient.post('/api/auth/signup', {
      first_name,
      last_name,
      email,
      password,
    }),
  )
}

export const login = async ({ email, password }) => {
  return toJsonOrThrow(
    apiClient.post('/api/auth/login', {
      email,
      password,
    }),
  )
}

export const fetchCurrentUser = async (token) => {
  return toJsonOrThrow(
    apiClient.get('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  )
}

export const refreshCurrentUser = async () => {
  const token = getSavedToken()

  if (!token) {
    return null
  }

  const payload = await fetchCurrentUser(token)
  saveSession({ token, user: payload.user })
  return payload.user
}

export const fetchDashboardData = async () => {
  const token = getSavedToken()

  if (!token) {
    throw new Error('Authentication required')
  }

  const payload = await toJsonOrThrow(
    apiClient.get('/api/auth/dashboard', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }),
  )

  if (payload.user) {
    saveSession({ token, user: payload.user })
  }

  return payload
}

export const saveSession = ({ token, user }) => {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export const getSavedToken = () => localStorage.getItem(TOKEN_KEY)

export const getSavedUser = () => {
  const rawUser = localStorage.getItem(USER_KEY)

  if (!rawUser) {
    return null
  }

  try {
    return JSON.parse(rawUser)
  } catch {
    return null
  }
}
