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

const signup = async (req, res) => {
  const { first_name, last_name, email, password } = req.body

  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ error: 'first_name, last_name, email, and password are required' })
  }

  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long' })
  }

  const normalizedEmail = String(email).toLowerCase().trim()
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [normalizedEmail])

    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK')
      return res.status(409).json({ error: 'Email is already registered' })
    }

    const password_hash = await hashPassword(password)

    const insertedUser = await client.query(
      `
      INSERT INTO users (first_name, last_name, email, password_hash, provider, provider_id, avatar_url)
      VALUES ($1, $2, $3, $4, 'local', NULL, NULL)
      RETURNING id, first_name, last_name, email, provider, avatar_url, created_at
      `,
      [first_name.trim(), last_name.trim(), normalizedEmail, password_hash]
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

    return res.status(201).json({ user: cleanUser(user), token })
  } catch (err) {
    await client.query('ROLLBACK')
    return res.status(500).json({ error: 'Failed to create account' })
  } finally {
    client.release()
  }
}

const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' })
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
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const user = result.rows[0]

    if (user.provider !== 'local' || !user.password_hash) {
      return res.status(400).json({ error: 'Use social sign-in for this account' })
    }

    const passwordValid = await comparePassword(password, user.password_hash)

    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = generateToken({ id: user.id, email: user.email, provider: user.provider })

    return res.status(200).json({ user: cleanUser(user), token })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to sign in' })
  }
}

const me = async (req, res) => {
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
      [req.user.id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const row = result.rows[0]

    return res.status(200).json({
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
    })
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load current user' })
  }
}

export default {
  signup,
  login,
  me,
}
