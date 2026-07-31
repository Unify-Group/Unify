import { pool } from '../config/db.js'

const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, first_name, last_name, avatar_url, email, provider, created_at                                                                                                                                           
      FROM users                                                                                                                                                                                                          
      ORDER BY id ASC
    `)
    res.status(200).json(result.rows)
  } catch (err) {
    res.status(409).json({ error: err.message })
    console.error('🚫 error to GET users:', err)
  }
}

const getUserById = async (req, res) => {
  const id = parseInt(req.params.id)
  try {
    const result = await pool.query(`
      SELECT id, first_name, last_name, avatar_url                                                                                                                                                                        
      FROM users                                                                                                                                                                                                          
      WHERE id = $1   
    `, [id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.status(200).json(result.rows)
  } catch (err) {
    res.status(409).json({ error: err.message })
    console.error('🚫 error to GET user by ID:', err)
  }
}

const getPublicProfileById = async (req, res) => {
  const id = parseInt(req.params.id)

  try {
    const userResult = await pool.query(
      `
      SELECT
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.avatar_url,
        u.created_at,
        p.bio,
        p.interests
      FROM users u
      LEFT JOIN profiles p ON p.user_id = u.id
      WHERE u.id = $1
      `,
      [id],
    )

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    const hostedEventsResult = await pool.query(
      `
      SELECT
        e.id,
        e.title,
        e.datetime,
        e.location,
        e.image_url,
        e.category_id,
        c.name AS category_name,
        COALESCE(attending.attending_count, 0)::INT AS attending_count
      FROM events e
      LEFT JOIN categories c ON c.id = e.category_id
      LEFT JOIN LATERAL (
        SELECT COUNT(*)::INT AS attending_count
        FROM rsvps r
        WHERE r.event_id = e.id AND r.status = 'attending'
      ) attending ON TRUE
      WHERE e.organizer_id = $1
      ORDER BY e.datetime DESC
      `,
      [id],
    )

    const user = userResult.rows[0]
    const hostedEvents = hostedEventsResult.rows
    const totalAttendees = hostedEvents.reduce(
      (sum, event) => sum + Number(event.attending_count || 0),
      0,
    )
    const createdAt = user.created_at ? new Date(user.created_at) : null
    const now = new Date()
    const yearsOrganizing = createdAt
      ? Math.max(0, now.getFullYear() - createdAt.getFullYear())
      : 0

    return res.status(200).json({
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        avatar_url: user.avatar_url,
        created_at: user.created_at,
        bio: user.bio,
        interests: user.interests,
      },
      stats: {
        eventsHosted: hostedEvents.length,
        totalAttendees,
        yearsOrganizing,
      },
      hostedEvents,
    })
  } catch (err) {
    res.status(409).json({ error: err.message })
    console.error('🚫 error to GET public user profile:', err)
  }
}

export default {
  getAllUsers,
  getUserById,
  getPublicProfileById,
}
