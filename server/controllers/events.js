import { pool } from '../config/db.js'
import { handleError } from '../utils/handleError.js'

const eventSelect = `
  SELECT
    e.*, c.name AS category_name
  FROM events e
  LEFT JOIN categories c ON c.id = e.category_id
`

const requireOrganizer = async (eventId, userId) => {
  const result = await pool.query('SELECT organizer_id FROM events WHERE id = $1', [eventId])

  if (result.rows.length === 0) {
    return { error: { status: 404, message: 'Event not found' } }
  }

  if (result.rows[0].organizer_id !== userId) {
    return { error: { status: 403, message: 'You can only edit your own events' } }
  }

  return { ok: true }
}

const createEvent = async (req, res) => {
  const { title, description, datetime, location, attendee_limit, category_id } = req.body
  const organizer_id = req.user?.id

  if (!organizer_id) {
    return handleError(
      res,
      { status: 401, code: 'AUTH_REQUIRED', message: 'Authentication required' },
      'Authentication required',
    )
  }

  try {
    const insertQuery = `
      INSERT INTO events (title, description, datetime, location, attendee_limit, category_id, organizer_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `
    const result = await pool.query(insertQuery, [
      title,
      description,
      datetime,
      location,
      attendee_limit,
      category_id,
      organizer_id,
    ])
    res.status(201).json(result.rows[0])
    console.log('🆕 event created successfully:', result.rows[0])
  } catch (err) {
    console.error('🚫 error to CREATE event:', err)
    return handleError(res, err, 'Failed to create event')
  }
}

const getAllEvents = async (req, res) => {
  try {
    const result = await pool.query(`${eventSelect} ORDER BY e.datetime ASC`)
    res.status(200).json(result.rows)
  } catch (err) {
    console.error('🚫 error to GET events:', err)
    return handleError(res, err, 'Failed to load events')
  }
}

const getEventById = async (req, res) => {
  const id = parseInt(req.params.id)
  try {
    const result = await pool.query(`${eventSelect} WHERE e.id = $1`, [id])
    if (result.rows.length === 0) {
      return handleError(
        res,
        { status: 404, code: 'NOT_FOUND', message: 'Event not found' },
        'Event not found',
      )
    }
    res.status(200).json(result.rows[0])
  } catch (err) {
    console.error('🚫 error to GET event by ID:', err)
    return handleError(res, err, 'Failed to load event')
  }
}

const updateEvent = async (req, res) => {
  const id = parseInt(req.params.id)
  const organizerId = req.user?.id
  const { title, description, datetime, location, attendee_limit, category_id } = req.body

  if (!organizerId) {
    return res.status(401).json({ message: 'Authentication required' })
  }

  try {
    const access = await requireOrganizer(id, organizerId)

    if (access.error) {
      return res.status(access.error.status).json({ error: access.error.message })
    }

    const result = await pool.query(
      `
      UPDATE events
      SET
        title = $1,
        description = $2,
        datetime = $3,
        location = $4,
        attendee_limit = $5,
        category_id = $6
      WHERE id = $7
      RETURNING *
      `,
      [title, description, datetime, location, attendee_limit, category_id, id],
    )

    res.status(200).json(result.rows[0])
  } catch (err) {
    res.status(409).json({ error: err.message })
    console.error('🚫 error to UPDATE event:', err)
  }
}

const deleteEvent = async (req, res) => {
  const id = parseInt(req.params.id)
  const organizerId = req.user?.id

  if (!organizerId) {
    return res.status(401).json({ message: 'Authentication required' })
  }

  try {
    const access = await requireOrganizer(id, organizerId)

    if (access.error) {
      return res.status(access.error.status).json({ error: access.error.message })
    }

    await pool.query('DELETE FROM events WHERE id = $1', [id])
    res.status(204).send()
  } catch (err) {
    res.status(409).json({ error: err.message })
    console.error('🚫 error to DELETE event:', err)
  }
}

export default {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
}
