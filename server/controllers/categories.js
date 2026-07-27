import { pool } from '../config/db.js'
import { handleError } from '../utils/handleError.js'

const getAllCategories = async (req, res) => {
  try {
    const selectQuery = 'SELECT * FROM categories ORDER BY id ASC'
    const result = await pool.query(selectQuery)
    res.status(200).json(result.rows)
  } catch (err) {
    console.error('🚫 error to GET categories:', err)
    return handleError(res, err, 'Failed to load categories')
  }
}

export default {
  getAllCategories,
}
