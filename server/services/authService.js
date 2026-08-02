import { pool } from '../config/db.js'
import { hashPassword, comparePassword } from '../utils/password.js'
import { generateToken } from '../utils/jwt.js'
import { archiveEventsForOrganizer, archivePastEvents } from './archiveService.js'

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

const normalizeCommaSeparated = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean)
      .join(', ')
  }

  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .join(', ')
}

const parseInterestTerms = (interests) =>
  String(interests || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)

const scoreEventForUser = (event, interestTerms) => {
  if (interestTerms.length === 0) {
    return 0
  }

  const haystack = [event.title, event.description, event.location, event.category_name]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  return interestTerms.reduce((score, term) => (haystack.includes(term) ? score + 1 : score), 0)
}

const throwHttpError = (status, message, code = 'REQUEST_ERROR', details = null) => {
  const err = new Error(message)
  err.status = status
  err.code = code
  err.details = details
  throw err
}

const resolveAuthenticatedUser = async (authUser, client = pool) => {
  const userId = typeof authUser === 'object' ? authUser?.id : authUser
  const email = typeof authUser === 'object' ? authUser?.email : null

  if (!userId && !email) {
    throwHttpError(401, 'Unauthorized', 'AUTH_REQUIRED')
  }

  if (userId) {
    const byId = await client.query('SELECT id, email FROM users WHERE id = $1', [userId])

    if (byId.rows.length > 0) {
      return byId.rows[0]
    }
  }

  if (email) {
    const normalizedEmail = String(email).toLowerCase().trim()
    const byEmail = await client.query('SELECT id, email FROM users WHERE email = $1', [normalizedEmail])

    if (byEmail.rows.length > 0) {
      return byEmail.rows[0]
    }
  }

  throwHttpError(404, 'User not found')
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

export const getCurrentUser = async (authUser) => {
  try {
    const resolvedUser = await resolveAuthenticatedUser(authUser)
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
        p.avatar_url AS profile_avatar_url,
        p.pronouns,
        p.identity_labels
      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id
      WHERE u.id = $1
      `,
      [resolvedUser.id]
    )

    if (result.rows.length === 0) {
      throwHttpError(404, 'User not found')
    }

    const row = result.rows[0]

    return {
      user: mapCurrentUser(row),
    }
  } catch (err) {
    if (err.status) {
      throw err
    }

    throwHttpError(500, 'Failed to load current user', 'ME_FAILED')
  }
}

export const getDashboardData = async (userId) => {
  try {
    await archivePastEvents()

    const resolvedUser = await resolveAuthenticatedUser(userId)
    const userResult = await pool.query(
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
      [resolvedUser.id]
    )

    if (userResult.rows.length === 0) {
      throwHttpError(404, 'User not found')
    }

    const user = mapCurrentUser(userResult.rows[0])

    const attendingUpcomingResult = await pool.query(
      `
      SELECT
        e.id,
        e.title,
        e.datetime,
        e.location,
        e.description,
        e.image_url,
        e.attendee_limit,
        e.organizer_id,
        e.category_id,
        e.created_at,
        c.name AS category_name,
        r.status,
        r.created_at AS rsvp_created_at
      FROM rsvps r
      INNER JOIN events e ON e.id = r.event_id
      LEFT JOIN categories c ON c.id = e.category_id
      WHERE r.user_id = $1
        AND r.status = 'attending'
        AND e.archived_at IS NULL
        AND e.datetime >= NOW()
      ORDER BY e.datetime ASC
      `,
      [resolvedUser.id]
    )

    const attendingPastResult = await pool.query(
      `
      SELECT
        ea.source_event_id AS id,
        ea.title,
        ea.datetime,
        ea.location,
        ea.description,
        ea.image_url,
        ea.attendee_limit,
        ea.organizer_id,
        ea.category_id,
        ea.created_at,
        c.name AS category_name,
        r.status,
        r.created_at AS rsvp_created_at
      FROM rsvps r
      INNER JOIN events_archive ea ON ea.source_event_id = r.event_id
      LEFT JOIN categories c ON c.id = ea.category_id
      WHERE r.user_id = $1
        AND r.status = 'attending'
      ORDER BY ea.datetime DESC
      `,
      [resolvedUser.id]
    )

    const hostedUpcomingResult = await pool.query(
      `
      SELECT
        e.id,
        e.title,
        e.datetime,
        e.location,
        e.description,
        e.image_url,
        e.attendee_limit,
        e.organizer_id,
        e.category_id,
        e.created_at,
        c.name AS category_name
      FROM events e
      LEFT JOIN categories c ON c.id = e.category_id
      WHERE e.organizer_id = $1
        AND e.archived_at IS NULL
        AND e.datetime >= NOW()
      ORDER BY e.datetime ASC
      `,
      [resolvedUser.id]
    )

    const hostedPastResult = await pool.query(
      `
      SELECT
        ea.source_event_id AS id,
        ea.title,
        ea.datetime,
        ea.location,
        ea.description,
        ea.image_url,
        ea.attendee_limit,
        ea.organizer_id,
        ea.category_id,
        ea.created_at,
        c.name AS category_name
      FROM events_archive ea
      LEFT JOIN categories c ON c.id = ea.category_id
      WHERE ea.organizer_id = $1
      ORDER BY ea.datetime DESC
      `,
      [resolvedUser.id]
    )

    const relatedConnectionsResult = await pool.query(
      `
      SELECT COUNT(DISTINCT related.user_id) AS connection_count
      FROM rsvps mine
      INNER JOIN rsvps related
        ON related.event_id = mine.event_id
       AND related.user_id <> mine.user_id
       AND related.status = 'attending'
      WHERE mine.user_id = $1 AND mine.status = 'attending'
      `,
      [resolvedUser.id]
    )

    const deletionNoticesResult = await pool.query(
      `
      SELECT id, event_id, event_title, message, created_at
      FROM event_deletion_notices
      WHERE recipient_user_id = $1
      ORDER BY created_at DESC
      LIMIT 5
      `,
      [resolvedUser.id],
    )

    const allEventsResult = await pool.query(
      `
      SELECT
        e.id,
        e.title,
        e.datetime,
        e.location,
        e.description,
        e.image_url,
        e.attendee_limit,
        e.organizer_id,
        e.category_id,
        e.created_at,
        c.name AS category_name
      FROM events e
      LEFT JOIN categories c ON c.id = e.category_id
      WHERE e.archived_at IS NULL AND e.datetime >= NOW()
      ORDER BY e.datetime ASC
      `
    )

    const attendingEvents = attendingUpcomingResult.rows
    const pastAttendingEvents = attendingPastResult.rows
    const hostedEvents = hostedUpcomingResult.rows
    const pastHostedEvents = hostedPastResult.rows
    const excludedEventIds = new Set([
      ...attendingEvents.map((event) => event.id),
      ...pastAttendingEvents.map((event) => event.id),
      ...hostedEvents.map((event) => event.id),
      ...pastHostedEvents.map((event) => event.id),
    ])
    const interestTerms = parseInterestTerms(user.profile?.interests)

    const recommendedEvents = allEventsResult.rows
      .filter((event) => !excludedEventIds.has(event.id))
      .map((event) => ({
        ...event,
        recommendation_score: scoreEventForUser(event, interestTerms),
      }))
      .sort((left, right) => {
        if (right.recommendation_score !== left.recommendation_score) {
          return right.recommendation_score - left.recommendation_score
        }

        return new Date(left.datetime) - new Date(right.datetime)
      })
      .slice(0, 4)

    const upNextEvent = attendingEvents[0] || hostedEvents[0] || null
    const connectionCount = Number(relatedConnectionsResult.rows[0]?.connection_count || 0)

    return {
      user,
      stats: {
        attendingCount: attendingEvents.length,
        hostingCount: hostedEvents.length,
        pastAttendingCount: pastAttendingEvents.length,
        pastHostingCount: pastHostedEvents.length,
        connectionsCount: connectionCount,
      },
      upNextEvent,
      attendingEvents,
      pastAttendingEvents,
      hostedEvents,
      pastHostedEvents,
      recommendedEvents,
      deletionNotices: deletionNoticesResult.rows,
    }
  } catch (err) {
    if (err.status) {
      throw err
    }

    throwHttpError(500, 'Failed to load dashboard', 'DASHBOARD_FAILED')
  }
}

export const deleteCurrentUserAccount = async (authUser, options = {}) => {
  const deleteEventsPermanently = Boolean(options?.deleteEventsPermanently)
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    const resolvedUser = await resolveAuthenticatedUser(authUser, client)

    const hostedEventsResult = await client.query(
      `
      SELECT id, title
      FROM events
      WHERE organizer_id = $1
      `,
      [resolvedUser.id],
    )

    const hostedEventIds = hostedEventsResult.rows.map((row) => Number(row.id)).filter(Boolean)

    if (hostedEventIds.length > 0) {
      if (deleteEventsPermanently) {
        const attendeeRows = await client.query(
          `
          SELECT
            r.user_id,
            r.event_id,
            e.title
          FROM rsvps r
          INNER JOIN events e ON e.id = r.event_id
          WHERE r.event_id = ANY($1::INT[])
            AND r.status = 'attending'
            AND r.user_id <> $2
          `,
          [hostedEventIds, resolvedUser.id],
        )

        for (const attendee of attendeeRows.rows) {
          await client.query(
            `
            INSERT INTO event_deletion_notices (recipient_user_id, event_id, event_title, message)
            VALUES ($1, $2, $3, $4)
            `,
            [
              attendee.user_id,
              attendee.event_id,
              attendee.title,
              `${attendee.title} has been deleted by the organizer.`,
            ],
          )
        }

        await client.query('DELETE FROM events_archive WHERE source_event_id = ANY($1::INT[])', [hostedEventIds])
        await client.query('DELETE FROM events WHERE id = ANY($1::INT[])', [hostedEventIds])
      } else {
        await archiveEventsForOrganizer(resolvedUser.id, client)
        await client.query('DELETE FROM events WHERE organizer_id = $1', [resolvedUser.id])
      }
    }

    const result = await client.query('DELETE FROM users WHERE id = $1 RETURNING id', [resolvedUser.id])

    if (result.rowCount === 0) {
      await client.query('ROLLBACK')
      throwHttpError(404, 'User not found')
    }

    await client.query('COMMIT')

    return { success: true }
  } catch (err) {
    await client.query('ROLLBACK')

    if (err.status) {
      throw err
    }

    throwHttpError(500, 'Failed to delete account', 'ACCOUNT_DELETE_FAILED')
  } finally {
    client.release()
  }
}

export const updateCurrentUserProfile = async (authUser, payload) => {
  const firstName = String(payload.first_name ?? payload.firstName ?? '').trim()
  const lastName = String(payload.last_name ?? payload.lastName ?? '').trim()
  const bio = String(payload.bio ?? '').trim() || null
  const avatarUrl = String(payload.avatar_url ?? payload.avatarUrl ?? '').trim() || null
  const pronouns = String(payload.pronouns ?? '').trim() || null
  const interests = normalizeCommaSeparated(payload.interests)
  const identityLabels = normalizeCommaSeparated(payload.identity_labels ?? payload.identityLabels)

  if (!firstName || !lastName) {
    throwHttpError(400, 'First and last name are required', 'VALIDATION_ERROR')
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    const resolvedUser = await resolveAuthenticatedUser(authUser, client)

    const userResult = await client.query(
      `
      UPDATE users
      SET first_name = $1, last_name = $2, avatar_url = $3
      WHERE id = $4
      RETURNING id, first_name, last_name, email, provider, avatar_url, created_at
      `,
      [firstName, lastName, avatarUrl, resolvedUser.id],
    )

    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK')
      throwHttpError(404, 'User not found')
    }

    const profileUpdate = await client.query(
      `
      UPDATE profiles
      SET bio = $1,
          interests = $2,
          avatar_url = $3,
          pronouns = $4,
          identity_labels = $5
      WHERE user_id = $6
      `,
      [
        bio,
        interests || null,
        avatarUrl,
        pronouns,
        identityLabels || null,
        resolvedUser.id,
      ],
    )

    if (profileUpdate.rowCount === 0) {
      await client.query(
        `
        INSERT INTO profiles (user_id, bio, interests, avatar_url, pronouns, identity_labels)
        VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [resolvedUser.id, bio, interests || null, avatarUrl, pronouns, identityLabels || null],
      )
    }

    await client.query('COMMIT')

    return getCurrentUser({ id: resolvedUser.id, email: resolvedUser.email })
  } catch (err) {
    await client.query('ROLLBACK')

    if (err.status) {
      throw err
    }

    throwHttpError(500, 'Failed to update profile', 'PROFILE_UPDATE_FAILED')
  } finally {
    client.release()
  }
}
