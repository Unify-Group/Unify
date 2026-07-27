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

export default {
  getAllUsers,
  getUserById,
}
