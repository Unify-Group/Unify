import { pool } from '../config/db.js'

export const getAllCategories = async (req, res) => {
  try {
    const selectQuery = 'SELECT * FROM categories'
    const result = await pool.query(selectQuery)
    res.status(200).json(result.rows)
  } catch (err) {
    res.status(409).json({ error: err.message })
    console.error('🚫 error to GET categories:', err)
  }
}

export default {
  getAllCategories,
}
