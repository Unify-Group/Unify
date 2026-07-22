import { verifyToken } from '../utils/jwt.js'

export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const token = authHeader.slice(7)

  try {
    const payload = verifyToken(token)
    req.user = payload
    return next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}
