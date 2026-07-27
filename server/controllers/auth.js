import {
  getCurrentUser,
  getDashboardData,
  loginUser,
  signupUser,
  updateCurrentUserProfile,
} from '../services/authService.js'
import { handleError } from '../utils/handleError.js'

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
