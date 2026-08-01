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

const handleStaleSession = (error) => {
  const status = error?.response?.status
  const message = extractErrorMessage(error)

  if (status === 401 || status === 404) {
    clearSession()
    throw new Error('Your session is out of date. Please sign in again.')
  }

  throw new Error(message)
}

export const getGitHubAuthUrl = async () => {
  return toJsonOrThrow(apiClient.get('/api/auth/github/auth-url'))
}

export const exchangeGitHubCode = async (code) => {
  return toJsonOrThrow(apiClient.post('/api/auth/github/callback', { code }))
}

export const getGoogleAuthUrl = async () => {
  return toJsonOrThrow(apiClient.get('/api/auth/google/auth-url'))
}

export const exchangeGoogleCode = async (code) => {
  return toJsonOrThrow(apiClient.post('/api/auth/google/callback', { code }))
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

  try {
    const payload = await fetchCurrentUser(token)
    saveSession({ token, user: payload.user })
    return payload.user
  } catch (error) {
    handleStaleSession(error)
  }
}

export const fetchDashboardData = async () => {
  const token = getSavedToken()

  if (!token) {
    throw new Error('Authentication required')
  }

  let payload

  try {
    payload = await toJsonOrThrow(
      apiClient.get('/api/auth/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    )
  } catch (error) {
    handleStaleSession(error)
  }

  if (payload.user) {
    saveSession({ token, user: payload.user })
  }

  return payload
}

export const updateCurrentUserProfile = async (profileData) => {
  const token = getSavedToken()

  if (!token) {
    throw new Error('Authentication required')
  }

  let payload

  try {
    payload = await toJsonOrThrow(
      apiClient.put('/api/auth/me', profileData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    )
  } catch (error) {
    handleStaleSession(error)
  }

  if (payload.user) {
    saveSession({ token, user: payload.user })
  }

  return payload.user
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
