import {
  getCurrentUser,
  getDashboardData,
  loginUser,
  signupUser,
  updateCurrentUserProfile,
} from '../services/authService.js'

const handleError = (res, err, fallbackMessage) => {
  const status = err.status || 500
  const message = err.message || fallbackMessage
  return res.status(status).json({
    error: {
      code: err.code || 'INTERNAL_ERROR',
      message,
      details: err.details || null,
    },
  })
}

export const signup = async (req, res) => {
  try {
    const result = await signupUser(req.body)
    return res.status(201).json(result)
  } catch (err) {
    return handleError(res, err, 'Signup endpoint coming soon!')
  }
}

export const login = async (req, res) => {
  try {
    const result = await loginUser(req.body)
    return res.status(200).json(result)
  } catch (err) {
    return handleError(res, err, 'Failed to sign in')
  }
}

export const me = async (req, res) => {
  try {
    const result = await getCurrentUser(req.user)
    return res.status(200).json(result)
  } catch (err) {
    return handleError(res, err, 'Failed to load current user')
  }
}

export const dashboard = async (req, res) => {
  try {
    const result = await getDashboardData(req.user)
    return res.status(200).json(result)
  } catch (err) {
    return handleError(res, err, 'Failed to load dashboard')
  }
}

export const updateMe = async (req, res) => {
  try {
    const result = await updateCurrentUserProfile(req.user, req.body)
    return res.status(200).json(result)
  } catch (err) {
    return handleError(res, err, 'Failed to update profile')
  }
}
