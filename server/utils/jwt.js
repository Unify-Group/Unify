import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-change-me'
const TOKEN_EXPIRES_IN = '7d'

export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRES_IN })
}

export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET)
}
