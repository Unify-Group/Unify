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

app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok' })
})

const ensureSchema = async () => {
  try {
    await pool.query('ALTER TABLE IF EXISTS events ADD COLUMN IF NOT EXISTS image_url TEXT')
    await pool.query('ALTER TABLE IF EXISTS events ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ')
    await pool.query(`
      CREATE TABLE IF NOT EXISTS events_archive (
        id SERIAL PRIMARY KEY,
        source_event_id INT NOT NULL UNIQUE,
        title VARCHAR(80) NOT NULL,
        datetime TIMESTAMPTZ NOT NULL,
        location VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        image_url TEXT,
        attendee_limit INT,
        organizer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        category_id INT REFERENCES categories(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL,
        archived_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)

    // Archived rows should survive account deletion.
    await pool.query('ALTER TABLE events_archive DROP CONSTRAINT IF EXISTS events_archive_organizer_id_fkey')
    await pool.query('ALTER TABLE events_archive ALTER COLUMN organizer_id DROP NOT NULL')

    await pool.query(`
      CREATE TABLE IF NOT EXISTS event_deletion_notices (
        id SERIAL PRIMARY KEY,
        recipient_user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        event_id INT,
        event_title VARCHAR(80) NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `)
  } catch (error) {
    console.error('Failed to ensure optional schema columns:', error)
  }
}

ensureSchema().finally(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`)
  })
})
