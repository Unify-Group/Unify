import { getGoogleAuthUrl, handleGoogleCallback } from '../services/googleAuthService.js'
import { handleError } from '../utils/handleError.js'

export const googleAuthUrl = async (req, res) => {
  try {
    return getGoogleAuthUrl(req, res)
  } catch (err) {
    console.error('[Google Auth Controller] getAuthUrl error:', err)
    return handleError(res, err, 'Failed to get Google auth URL')
  }
}

export const googleCallback = async (req, res) => {
  try {
    return await handleGoogleCallback(req, res)
  } catch (err) {
    console.error('[Google Auth Controller] callback error:', err)
    return handleError(res, err, 'Failed to authenticate with Google')
  }
}
