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

const cleanUser = (row) => ({
  id: row.id,
  first_name: row.first_name,
  last_name: row.last_name,
  email: row.email,
  provider: row.provider,
  avatar_url: row.avatar_url,
  created_at: row.created_at,
})

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

export const getGitHubAuthUrl = (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID
  const redirectUri = process.env.GITHUB_REDIRECT_URI

  if (!clientId || !redirectUri) {
    return res.status(500).json({ error: 'GitHub OAuth not configured' })
  }

  const state = Buffer.from(JSON.stringify({ provider: 'github', nonce: Math.random().toString() })).toString('base64')
  const scope = 'user:email'
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`

  res.json({ url, state })
}

export const handleGitHubCallback = async (req, res) => {
  const { code } = req.body

  console.log('[GitHub Auth] Callback received with code:', code?.substring(0, 10) + '...')

  if (!code) {
    throwHttpError(400, 'Authorization code is required')
  }

  const clientId = process.env.GITHUB_CLIENT_ID
  const clientSecret = process.env.GITHUB_CLIENT_SECRET
  const redirectUri = process.env.GITHUB_REDIRECT_URI

  console.log('[GitHub Auth] Config check:', {
    hasClientId: !!clientId,
    hasClientSecret: !!clientSecret,
    redirectUri: redirectUri,
  })

  if (!clientId || !clientSecret || !redirectUri) {
    throwHttpError(500, 'GitHub OAuth not configured')
  }

  try {
    console.log('[GitHub Auth] Exchanging code for token with GitHub API...')
    const tokenResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      },
      {
        headers: {
          Accept: 'application/json',
        },
      }
    )

    console.log('[GitHub Auth] Token response status:', tokenResponse.status)
    console.log('[GitHub Auth] Token response data:', {
      hasError: !!tokenResponse.data.error,
      error: tokenResponse.data.error,
      error_description: tokenResponse.data.error_description,
      hasToken: !!tokenResponse.data.access_token,
      tokenType: tokenResponse.data.token_type,
      scope: tokenResponse.data.scope,
    })

    if (tokenResponse.data.error) {
      console.error('[GitHub Auth] GitHub API error response:', tokenResponse.data)
      throwHttpError(400, `GitHub API error: ${tokenResponse.data.error_description || tokenResponse.data.error}`)
    }

    if (!tokenResponse.data.access_token) {
      console.error('[GitHub Auth] No access token in response:', tokenResponse.data)
      throwHttpError(400, 'No access token received from GitHub')
    }

    const accessToken = tokenResponse.data.access_token

    console.log('[GitHub Auth] Got access token:', {
      hasToken: !!accessToken,
      tokenLength: accessToken?.length,
      tokenPrefix: accessToken?.substring(0, 10),
    })

    console.log('[GitHub Auth] Fetching user data from GitHub API...')
    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json',
      },
    })

    const githubUser = userResponse.data
    console.log('[GitHub Auth] GitHub user data:', {
      id: githubUser.id,
      login: githubUser.login,
      email: githubUser.email,
      avatar_url: githubUser.avatar_url,
    })

    const email = githubUser.email || `${githubUser.login}@github.com`
    const [firstName = '', lastName = ''] = (githubUser.name || githubUser.login).split(' ', 2)
    const providerId = githubUser.id.toString()

    console.log('[GitHub Auth] Parsed user info:', {
      firstName,
      lastName,
      email,
      providerId,
    })

    const client = await pool.connect()

    try {
      console.log('[GitHub Auth] Starting database transaction...')
      await client.query('BEGIN')

      let existingUser = await client.query('SELECT id FROM users WHERE email = $1', [email])

      let user

      if (existingUser.rows.length > 0) {
        console.log('[GitHub Auth] User exists, updating provider and avatar...')
        const userId = existingUser.rows[0].id

        await client.query(
          `
          UPDATE users
          SET provider = $1, provider_id = $2, avatar_url = $3
          WHERE id = $4
          `,
          ['github', providerId, githubUser.avatar_url, userId]
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
        console.log('[GitHub Auth] Creating new user...')
        const insertedUser = await client.query(
          `
          INSERT INTO users (first_name, last_name, email, provider, provider_id, avatar_url)
          VALUES ($1, $2, $3, 'github', $4, $5)
          RETURNING id, first_name, last_name, email, provider, avatar_url, created_at
          `,
          [firstName, lastName, email, providerId, githubUser.avatar_url]
        )

        const newUser = insertedUser.rows[0]
        console.log('[GitHub Auth] New user created with ID:', newUser.id)

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

      console.log('[GitHub Auth] Committing transaction...')
      await client.query('COMMIT')

      const userData = mapCurrentUser(user.rows[0])
      const token = generateToken({ id: userData.id, email: userData.email, provider: userData.provider })

      console.log('[GitHub Auth] Authentication successful, returning token and user data')
      return res.status(200).json({
        user: userData,
        token,
      })
    } catch (err) {
      console.error('[GitHub Auth] Database error:', err.message)
      await client.query('ROLLBACK')
      throw err
    } finally {
      client.release()
    }
  } catch (err) {
    console.error('[GitHub Auth] Authentication failed:', {
      message: err.message,
      status: err.status,
      code: err.code,
      details: err.details,
      axiosStatus: err.response?.status,
      axiosData: err.response?.data,
    })

    if (err.status) {
      throw err
    }

    if (err.response) {
      console.error('[GitHub Auth] GitHub API rejected request:', {
        status: err.response.status,
        statusText: err.response.statusText,
        data: err.response.data,
      })
      throwHttpError(
        err.response.status,
        `GitHub authentication failed: ${err.response.data?.message || err.response.statusText}`,
        'GITHUB_API_ERROR',
        {
          githubError: err.response.data,
        }
      )
    }

    console.error('[GitHub Auth] Unexpected error:', err)
    throwHttpError(500, 'Failed to authenticate with GitHub', 'GITHUB_AUTH_FAILED', {
      originalError: err.message,
    })
  }
}
