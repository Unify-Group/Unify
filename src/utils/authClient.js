import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
const TOKEN_KEY = 'unify_token'
const USER_KEY = 'unify_user'

const client = axios.create({
  baseURL: API_BASE_URL,
})

const toJsonOrThrow = async (promise) => {
  try {
    const response = await promise
    return response.data
  } catch (error) {
    const payload = error?.response?.data || {}
    const message =
      payload?.error?.message || payload?.message || payload?.error || error?.message || 'Request failed'
    throw new Error(message)
  }
}

export const signup = async ({ first_name, last_name, email, password }) => {
  return toJsonOrThrow(
    client.post('/api/auth/signup', {
      first_name,
      last_name,
      email,
      password,
    })
  )
}

export const login = async ({ email, password }) => {
  return toJsonOrThrow(
    client.post('/api/auth/login', {
      email,
      password,
    })
  )
}

export const fetchCurrentUser = async (token) => {
  return toJsonOrThrow(
    client.get('/api/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
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

export const saveSession = ({ token, user }) => {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export const getSavedToken = () => localStorage.getItem(TOKEN_KEY)
