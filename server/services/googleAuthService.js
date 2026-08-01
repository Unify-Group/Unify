import { pool } from '../config/db.js'
import { generateToken } from '../utils/jwt.js'
import axios from 'axios'

const throwHttpError = (status, message, code = 'REQUEST_ERROR', details = null) => {
  const err = new Error(message)
  err.status = status
  err.code = code
  err.details = details
  throw err
}

const mapCurrentUser = (row) => ({
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
    pronouns: row.pronouns,
    identity_labels: row.identity_labels,
  },
})

export const getGoogleAuthUrl = (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const redirectUri = process.env.GOOGLE_REDIRECT_URI

  if (!clientId || !redirectUri) {
    return res.status(500).json({ error: 'Google OAuth not configured' })
  }

  const state = Buffer.from(JSON.stringify({ provider: 'google', nonce: Math.random().toString() })).toString('base64')
  const scope = 'openid email profile'
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${encodeURIComponent(scope)}&state=${state}`

  res.json({ url, state })
}

export const handleGoogleCallback = async (req, res) => {
  const { code } = req.body

  console.log('[Google Auth] Callback received with code:', code?.substring(0, 10) + '...')

  if (!code) {
    throwHttpError(400, 'Authorization code is required')
  }

  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_REDIRECT_URI

  console.log('[Google Auth] Config check:', {
    hasClientId: !!clientId,
    hasClientSecret: !!clientSecret,
    redirectUri: redirectUri,
  })

  if (!clientId || !clientSecret || !redirectUri) {
    throwHttpError(500, 'Google OAuth not configured')
  }

  try {
    console.log('[Google Auth] Exchanging code for token with Google API...')
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    })

    console.log('[Google Auth] Token response:', {
      hasIdToken: !!tokenResponse.data.id_token,
      hasAccessToken: !!tokenResponse.data.access_token,
    })

    if (!tokenResponse.data.id_token) {
      throwHttpError(400, 'Failed to get ID token from Google')
    }

    const accessToken = tokenResponse.data.access_token
    const idToken = tokenResponse.data.id_token

    console.log('[Google Auth] Fetching user data from Google API...')
    const userResponse = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    const googleUser = userResponse.data
    console.log('[Google Auth] Google user data:', {
      id: googleUser.id,
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture,
    })

    const email = googleUser.email
    const [firstName = '', lastName = ''] = (googleUser.name || 'User').split(' ', 2)
    const providerId = googleUser.id.toString()

    console.log('[Google Auth] Parsed user info:', {
      firstName,
      lastName,
      email,
      providerId,
    })

    const client = await pool.connect()

    try {
      console.log('[Google Auth] Starting database transaction...')
      await client.query('BEGIN')

      let existingUser = await client.query('SELECT id FROM users WHERE email = $1', [email])

      let user

      if (existingUser.rows.length > 0) {
        console.log('[Google Auth] User exists, updating provider and avatar...')
        const userId = existingUser.rows[0].id

        await client.query(
          `
          UPDATE users
          SET provider = $1, provider_id = $2, avatar_url = $3
          WHERE id = $4
          `,
          ['google', providerId, googleUser.picture, userId]
        )

        user = await client.query(
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
            p.avatar_url AS profile_avatar_url,
            p.pronouns,
            p.identity_labels
          FROM users u
          LEFT JOIN profiles p ON p.user_id = u.id
          WHERE u.id = $1
          `,
          [userId]
        )
      } else {
        console.log('[Google Auth] Creating new user...')
        const insertedUser = await client.query(
          `
          INSERT INTO users (first_name, last_name, email, provider, provider_id, avatar_url)
          VALUES ($1, $2, $3, 'google', $4, $5)
          RETURNING id, first_name, last_name, email, provider, avatar_url, created_at
          `,
          [firstName, lastName, email, providerId, googleUser.picture]
        )

        const newUser = insertedUser.rows[0]
        console.log('[Google Auth] New user created with ID:', newUser.id)

        await client.query(
          `
          INSERT INTO profiles (user_id, bio, interests, avatar_url)
          VALUES ($1, NULL, NULL, NULL)
          `,
          [newUser.id]
        )

        user = await client.query(
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
            p.avatar_url AS profile_avatar_url,
            p.pronouns,
            p.identity_labels
          FROM users u
          LEFT JOIN profiles p ON p.user_id = u.id
          WHERE u.id = $1
          `,
          [newUser.id]
        )
      }

      console.log('[Google Auth] Committing transaction...')
      await client.query('COMMIT')

      const userData = mapCurrentUser(user.rows[0])
      const token = generateToken({ id: userData.id, email: userData.email, provider: userData.provider })

      console.log('[Google Auth] Authentication successful, returning token and user data')
      return res.status(200).json({
        user: userData,
        token,
      })
    } catch (err) {
      console.error('[Google Auth] Database error:', err.message)
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  } catch (err) {
    console.error('[Google Auth] Authentication failed:', {
      message: err.message,
      status: err.status,
      code: err.code,
      details: err.details,
    })

    if (err.status) {
      throw err
    }

    console.error('[Google Auth] Unexpected error:', err)
    throwHttpError(500, 'Failed to authenticate with Google', 'GOOGLE_AUTH_FAILED', {
      originalError: err.message,
    })
  }
}
