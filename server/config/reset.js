import { pool } from './db.js'
import './dotenv.js'
import categoryData from './data/categories.js'
import userData from './data/users.js'
import eventData from './data/events.js'
import rsvpData from './data/rsvps.js'

// STRETCH: Add auth-related columns
const createUsersTable = async () => {
  const createTableQuery = `
        DROP TABLE IF EXISTS users CASCADE;

        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(80) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            bio TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `

  try {
    await pool.query(createTableQuery)
    console.log('✅ users table created successfully')
  } catch (err) {
    console.error('❌ error creating users table:', err)
    throw err
  }
}

const createCategoriesTable = async () => {
  const createTableQuery = `
        DROP TABLE IF EXISTS categories CASCADE;

        CREATE TABLE categories (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) NOT NULL UNIQUE
        )
    `

  try {
    await pool.query(createTableQuery)
    console.log('✅ categories table created successfully')
  } catch (err) {
    console.error('❌ error creating categories table:', err)
    throw err
  }
}

const seedCategoriesTable = async () => {
  const insertQuery = `
        INSERT INTO categories (name)
        VALUES ($1)
    `

  try {
    await Promise.all(categoryData.map((category) => pool.query(insertQuery, [category.name])))
    console.log('✅ categories seeded successfully')
  } catch (err) {
    console.error('⚠️ error inserting categories:', err)
    throw err
  }
}

const seedUsersTable = async () => {
  const insertQuery = `
        INSERT INTO users (name, email, bio)
        VALUES ($1, $2, $3)
    `

  try {
    await Promise.all(
      userData.map((user) => pool.query(insertQuery, [user.name, user.email, user.bio]))
    )
    console.log('✅ users seeded successfully')
  } catch (err) {
    console.error('⚠️ error inserting users:', err)
    throw err
  }
}

// STRETCH: Implement location data
const createEventsTable = async () => {
  const createTableQuery = `
        DROP TABLE IF EXISTS events CASCADE;

        CREATE TABLE events (
            id SERIAL PRIMARY KEY,
            title VARCHAR(80) NOT NULL,
            datetime TIMESTAMPTZ NOT NULL,
            location VARCHAR(255) NOT NULL,
            description TEXT,
            attendee_limit INT CHECK (attendee_limit > 0),
            organizer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            category_id INT REFERENCES categories(id) ON DELETE SET NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `
  try {
    await pool.query(createTableQuery)
    console.log('✅ events table created successfully')
  } catch (err) {
    console.error('❌ error creating events table:', err)
    throw err
  }
}

const seedEventsTable = async () => {
  const insertQuery = `
        INSERT INTO events (title, datetime, location, description, attendee_limit, organizer_id, category_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    `

  try {
    await Promise.all(
      eventData.map((event) =>
        pool.query(insertQuery, [
          event.title,
          event.datetime,
          event.location,
          event.description,
          event.attendee_limit,
          event.organizer_id,
          event.category_id,
        ])
      )
    )
    console.log('✅ events seeded successfully')
  } catch (err) {
    console.error('⚠️ error inserting events:', err)
    throw err
  }
}

const createRsvpsTable = async () => {
  const createTableQuery = `
        DROP TABLE IF EXISTS rsvps CASCADE;

        CREATE TABLE rsvps (
            user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            event_id INT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
            status VARCHAR(20) NOT NULL DEFAULT 'attending' CHECK (status IN('attending', 'waitlisted')),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            PRIMARY KEY (user_id, event_id)
        )
    `
  try {
    await pool.query(createTableQuery)
    console.log('✅ rsvps table created successfully')
  } catch (err) {
    console.error('❌ error creating rsvps table:', err)
    throw err
  }
}

const seedRsvpsTable = async () => {
  const insertQuery = `
        INSERT INTO rsvps (user_id, event_id, status)
        VALUES ($1, $2, $3)
    `

  try {
    await Promise.all(
      rsvpData.map((rsvp) => pool.query(insertQuery, [rsvp.user_id, rsvp.event_id, rsvp.status]))
    )
    console.log('✅ rsvps seeded successfully')
  } catch (err) {
    console.error('⚠️ error inserting rsvps:', err)
    throw err
  }
}

const resetDb = async () => {
  try {
    await createUsersTable()
    await createCategoriesTable()
    await createEventsTable()
    await createRsvpsTable()
    await seedUsersTable()
    await seedCategoriesTable()
    await seedEventsTable()
    await seedRsvpsTable()
    console.log('🎉 database reset complete')
  } catch (err) {
    console.error('❌ database reset failed:', err)
  } finally {
    await pool.end()
  }
}

resetDb()
