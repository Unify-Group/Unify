const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
const TOKEN_KEY = 'unify_token'
const USER_KEY = 'unify_user'

const toJsonOrThrow = async (response) => {
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message =
      payload?.error?.message || payload?.message || payload?.error || 'Request failed'
    throw new Error(message)
  }

  return payload
}

export const signup = async ({ first_name, last_name, email, password }) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ first_name, last_name, email, password }),
  })

  return toJsonOrThrow(response)
}

export const login = async ({ email, password }) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })

  return toJsonOrThrow(response)
}

export const fetchCurrentUser = async (token) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  return toJsonOrThrow(response)
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
