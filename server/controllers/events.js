import { pool } from '../config/db.js'

const createEvent = async (req, res) => {
  const { category_id, title, details, event_date, duration, location, max_capacity } = req.body

  try {
    const insertQuery = `
      INSERT INTO events (category_id, title, details, event_date, duration, location, max_capacity)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *,
    `
    const result = await pool.query(insertQuery, [
      category_id,
      title,
      details,
      event_date,
      duration,
      location,
      max_capacity,
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
