import './config/dotenv.js'
import express from 'express'
import cors from 'cors'
import categoryRoutes from './routes/categories.js'
import eventRoutes from './routes/events.js'
import userRoutes from './routes/users.js'
import authRoutes from './routes/auth.js'
import rsvpRoutes from './routes/rsvps.js'
import { pool } from './config/db.js'

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json({ limit: '10mb' }))
app.use(cors())

app.use('/api/categories', categoryRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/users', userRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/rsvps', rsvpRoutes)

app.get('/', (req, res) => {
  res.status(200).send(`<h1 style="text-align: center; margin-top: 3rem;">🤝 Unify API</h1>`)
})

const ensureSchema = async () => {
  try {
    await pool.query('ALTER TABLE IF EXISTS events ADD COLUMN IF NOT EXISTS image_url TEXT')
  } catch (error) {
    console.error('Failed to ensure optional schema columns:', error)
  }
}

ensureSchema().finally(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
  })
})
