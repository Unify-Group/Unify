const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
const TOKEN_KEY = 'unify_token'
const USER_KEY = 'unify_user'

const toJsonOrThrow = async (response) => {
  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(payload.error || 'Request failed')
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

export const saveSession = ({ token, user }) => {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

export const getSavedToken = () => localStorage.getItem(TOKEN_KEY)
