import { pool } from '../config/db.js'
import { handleError } from '../utils/handleError.js'

const createRsvp = async (req, res) => {
  const eventId = parseInt(req.params.eventId)
  const userId = req.user?.id

  try {
    const result = await pool.query(
      `
      INSERT INTO rsvps (user_id, event_id, status)
      VALUES ($1, $2, 'attending')
      ON CONFLICT (user_id, event_id) DO UPDATE SET status = 'attending'
      RETURNING *
      `,
      [userId, eventId],
    )
    res.status(200).json(result.rows[0])
  } catch (err) {
    console.error('🚫 error to CREATE rsvp:', err)
    return handleError(res, err, 'Failed to RSVP to event')
  }
}

const deleteRsvp = async (req, res) => {
  const eventId = parseInt(req.params.eventId)
  const userId = req.user?.id

  try {
    await pool.query('DELETE FROM rsvps WHERE user_id = $1 AND event_id = $2', [userId, eventId])
    res.status(204).send()
  } catch (err) {
    console.error('🚫 error to DELETE rsvp:', err)
    return handleError(res, err, 'Failed to cancel RSVP')
  }
}

const getMyRsvp = async (req, res) => {
  const eventId = parseInt(req.params.eventId)
  const userId = req.user?.id

  try {
    const result = await pool.query('SELECT status FROM rsvps WHERE user_id = $1 AND event_id = $2', [
      userId,
      eventId,
    ])
    res.status(200).json(result.rows[0] || null)
  } catch (err) {
    console.error('🚫 error to GET rsvp:', err)
    return handleError(res, err, 'Failed to load RSVP status')
  }
}

const getAttendeeCount = async (req, res) => {
  const eventId = parseInt(req.params.eventId)

  try {
    const result = await pool.query(
      "SELECT COUNT(*) FROM rsvps WHERE event_id = $1 AND status = 'attending'",
      [eventId],
    )
    res.status(200).json({ count: parseInt(result.rows[0].count) })
  } catch (err) {
    console.error('🚫 error to GET rsvp count:', err)
    return handleError(res, err, 'Failed to load attendee count')
  }
}

const getAttendees = async (req, res) => {
  const eventId = parseInt(req.params.eventId)

  try {
    const result = await pool.query(
      `
      SELECT u.id, u.first_name, u.last_name, u.avatar_url
      FROM rsvps r
      INNER JOIN users u ON u.id = r.user_id
      WHERE r.event_id = $1 AND r.status = 'attending'
      ORDER BY u.first_name ASC, u.last_name ASC
      `,
      [eventId],
    )
    res.status(200).json(result.rows)
  } catch (err) {
    console.error('🚫 error to GET attendees:', err)
    return handleError(res, err, 'Failed to load attendees')
  }
}

export default {
  createRsvp,
  deleteRsvp,
  getMyRsvp,
  getAttendeeCount,
  getAttendees,
}
