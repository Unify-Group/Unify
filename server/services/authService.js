import { pool } from '../config/db.js'
import { hashPassword, comparePassword } from '../utils/password.js'
import { generateToken } from '../utils/jwt.js'

const cleanUser = (row) => ({
  id: row.id,
  first_name: row.first_name,
  last_name: row.last_name,
  email: row.email,
  provider: row.provider,
  avatar_url: row.avatar_url,
  created_at: row.created_at,
})

const throwHttpError = (status, message, code = 'REQUEST_ERROR', details = null) => {
  const err = new Error(message)
  err.status = status
  err.code = code
  err.details = details
  throw err
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const validateSignupPayload = (payload) => {
  const firstName = (payload.first_name ?? payload.firstName ?? '').trim()
  const lastName = (payload.last_name ?? payload.lastName ?? '').trim()
  const email = String(payload.email ?? '')
    .toLowerCase()
    .trim()
  const password = String(payload.password ?? '')

  const missingFields = []

  if (!firstName) missingFields.push('first_name')
  if (!lastName) missingFields.push('last_name')
  if (!email) missingFields.push('email')
  if (!password) missingFields.push('password')

  if (missingFields.length > 0) {
    throwHttpError(400, 'Missing required fields', 'VALIDATION_ERROR', { missingFields })
  }

  if (!EMAIL_PATTERN.test(email)) {
    throwHttpError(400, 'Invalid email format', 'INVALID_EMAIL')
  }

  if (password.length < 8) {
    throwHttpError(400, 'Password must be at least 8 characters long', 'WEAK_PASSWORD')
  }

  return {
    firstName,
    lastName,
    email,
    password,
  }
}

export const signupUser = async (payload) => {
  const { firstName, lastName, email, password } = validateSignupPayload(payload)
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [email])

    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK')
      throwHttpError(409, 'Email is already registered', 'EMAIL_EXISTS')
    }

    const password_hash = await hashPassword(password)

    const insertedUser = await client.query(
      `
      INSERT INTO users (first_name, last_name, email, password_hash, provider, provider_id, avatar_url)
      VALUES ($1, $2, $3, $4, 'local', NULL, NULL)
      RETURNING id, first_name, last_name, email, provider, avatar_url, created_at
      `,
      [firstName, lastName, email, password_hash]
    )

    const user = insertedUser.rows[0]

    await client.query(
      `
      INSERT INTO profiles (user_id, bio, interests, avatar_url)
      VALUES ($1, NULL, NULL, NULL)
      `,
      [user.id]
    )

    await client.query('COMMIT')

    const token = generateToken({ id: user.id, email: user.email, provider: user.provider })

    return { user: cleanUser(user), token }
  } catch (err) {
    await client.query('ROLLBACK')

    if (err.status) {
      throw err
    }

    throwHttpError(500, 'Failed to create account', 'SIGNUP_FAILED')
  } finally {
    client.release()
  }
}

export const loginUser = async (payload) => {
  const { email, password } = payload

  if (!email || !password) {
    throwHttpError(400, 'email and password are required')
  }

  const normalizedEmail = String(email).toLowerCase().trim()

  try {
    const result = await pool.query(
      `
      SELECT id, first_name, last_name, email, password_hash, provider, avatar_url, created_at
      FROM users
      WHERE email = $1
      `,
      [normalizedEmail]
    )

    if (result.rows.length === 0) {
      throwHttpError(401, 'Invalid email or password')
    }

    const user = result.rows[0]

    if (user.provider !== 'local' || !user.password_hash) {
      throwHttpError(400, 'Use social sign-in for this account')
    }

    const passwordValid = await comparePassword(password, user.password_hash)

    if (!passwordValid) {
      throwHttpError(401, 'Invalid email or password')
    }

    const token = generateToken({ id: user.id, email: user.email, provider: user.provider })

    return { user: cleanUser(user), token }
  } catch (err) {
    if (err.status) {
      throw err
    }

    throwHttpError(500, 'Failed to sign in')
  }
}

export const getCurrentUser = async (userId) => {
  if (!userId) {
    throwHttpError(401, 'Unauthorized', 'AUTH_REQUIRED')
  }

  try {
    const result = await pool.query(
      `
      SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.provider,
        u.avatar_url,
        u.created_at,
        p.bio,
        p.interests,
        p.avatar_url AS profile_avatar_url
      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id
      WHERE u.id = $1
      `,
      [userId]
    )

    if (result.rows.length === 0) {
      throwHttpError(404, 'User not found')
    }

    const row = result.rows[0]

    return {
      user: {
        id: row.id,
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
        provider: row.provider,
        avatar_url: row.avatar_url,
        created_at: row.created_at,
        profile: {
          bio: row.bio,
          interests: row.interests,
          avatar_url: row.profile_avatar_url,
        },
      },
    }
  } catch (err) {
    if (err.status) {
      throw err
    }

    throwHttpError(500, 'Failed to load current user', 'ME_FAILED')
  }
}
