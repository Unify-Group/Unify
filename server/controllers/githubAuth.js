import { getGitHubAuthUrl, handleGitHubCallback } from '../services/githubAuthService.js'
import { handleError } from '../utils/handleError.js'

export const githubAuthUrl = async (req, res) => {
  try {
    return getGitHubAuthUrl(req, res)
  } catch (err) {
    console.error('[GitHub Auth Controller] getAuthUrl error:', err)
    return handleError(res, err, 'Failed to get GitHub auth URL')
  }
}

export const githubCallback = async (req, res) => {
  try {
    return await handleGitHubCallback(req, res)
  } catch (err) {
    console.error('[GitHub Auth Controller] callback error:', err)
    return handleError(res, err, 'Failed to authenticate with GitHub')
  }
}
