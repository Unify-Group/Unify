import { pool } from '../config/db.js'

const createEvent = async (req, res) => {
  const { title, description, datetime, location, attendee_limit, category_id } = req.body

  try {
    const insertQuery = `
      INSERT INTO events (title, description, datetime, location, attendee_limit, category_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `
    const result = await pool.query(insertQuery, [
      title,
      description,
      datetime,
      location,
      attendee_limit,
      category_id,
    ])
    res.status(201).json(result.rows[0])
    console.log('🆕 event created successfully:', result.rows[0])
  } catch (err) {
    res.status(409).json({ error: err.message })
    console.error('🚫 error to CREATE event:', err)
  }
}

const getAllEvents = async (req, res) => {
  try {
    const selectQuery = 'SELECT * FROM events ORDER BY event_date ASC'
    const result = await pool.query(selectQuery)
    res.status(200).json(result.rows)
  } catch (err) {
    res.status(409).json({ error: err.message })
    console.error('🚫 error to GET events:', err)
  }
}

const getEventById = async (req, res) => {
  const id = parseInt(req.params.id)
  try {
    const selectQuery = 'SELECT * FROM events WHERE id = $1'
    const result = await pool.query(selectQuery, [id])
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Event not found' })
    }
    res.status(200).json(result.rows[0])
  } catch (err) {
    res.status(409).json({ error: err.message })
    console.error('🚫 error to GET event by ID:', err)
  }
}

export default {
  getAllEvents,
  getEventById,
}
