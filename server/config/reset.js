import { pool } from './db.js'
import './dotenv.js'
import categoryData from './data/categories.js'
import userData from './data/users.js'
import eventData from './data/events.js'
import rsvpData from './data/rsvps.js'
import profileData from './data/profiles.js'

if (!process.argv.includes('--force')) {
  console.error('Refusing to reset database without explicit confirmation.')
  console.error('This command deletes ALL users, profiles, events, categories, and RSVPs.')
  console.error('Run again with: npm run reset -- --force')
  process.exit(1)
}

const createUsersTable = async () => {
  const createTableQuery = `
        DROP TABLE IF EXISTS users CASCADE;

        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            first_name VARCHAR(80) NOT NULL,
            last_name VARCHAR(80) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password_hash TEXT,
            provider VARCHAR(20) NOT NULL DEFAULT 'local' CHECK (provider IN ('local', 'google', 'github')),
            provider_id VARCHAR(255),
            avatar_url TEXT,
            CONSTRAINT users_provider_identity_unique UNIQUE (provider, provider_id),
            CONSTRAINT users_auth_shape CHECK (
              (provider = 'local' AND provider_id IS NULL AND password_hash IS NOT NULL)
              OR (provider IN ('google', 'github') AND provider_id IS NOT NULL)
            ),
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

const createProfilesTable = async () => {
  const createTableQuery = `
        DROP TABLE IF EXISTS profiles CASCADE;

        CREATE TABLE profiles (
            id SERIAL PRIMARY KEY,
            user_id INT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
            bio TEXT,
            interests TEXT,
          avatar_url TEXT,
          pronouns VARCHAR(80),
          identity_labels TEXT
        )
    `

  try {
    await pool.query(createTableQuery)
    console.log('✅ profiles table created successfully')
  } catch (err) {
    console.error('❌ error creating profiles table:', err)
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
        INSERT INTO users (first_name, last_name, email, password_hash, provider, provider_id, avatar_url)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    `

  try {
    await Promise.all(
      userData.map((user) =>
        pool.query(insertQuery, [
          user.first_name,
          user.last_name,
          user.email,
          user.password_hash,
          user.provider,
          user.provider_id,
          user.avatar_url,
        ])
      )
    )
    console.log('✅ users seeded successfully')
  } catch (err) {
    console.error('⚠️ error inserting users:', err)
    throw err
  }
}

const seedProfilesTable = async () => {
  const insertQuery = `
        INSERT INTO profiles (user_id, bio, interests, avatar_url, pronouns, identity_labels)
        VALUES ($1, $2, $3, $4, $5, $6)
    `

  try {
    await Promise.all(
      profileData.map((profile) =>
        pool.query(insertQuery, [
          profile.user_id,
          profile.bio,
          profile.interests,
          profile.avatar_url,
          profile.pronouns,
          profile.identity_labels,
        ])
      )
    )
    console.log('✅ profiles seeded successfully')
  } catch (err) {
    console.error('⚠️ error inserting profiles:', err)
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
            description TEXT NOT NULL,
          image_url TEXT,
            archived_at TIMESTAMPTZ,
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

const createEventsArchiveTable = async () => {
  const createTableQuery = `
        DROP TABLE IF EXISTS events_archive CASCADE;

        CREATE TABLE events_archive (
            id SERIAL PRIMARY KEY,
            source_event_id INT NOT NULL UNIQUE,
            title VARCHAR(80) NOT NULL,
            datetime TIMESTAMPTZ NOT NULL,
            location VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            image_url TEXT,
            attendee_limit INT CHECK (attendee_limit > 0),
            organizer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            category_id INT REFERENCES categories(id) ON DELETE SET NULL,
            created_at TIMESTAMPTZ NOT NULL,
            archived_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `

  try {
    await pool.query(createTableQuery)
    console.log('✅ events_archive table created successfully')
  } catch (err) {
    console.error('❌ error creating events_archive table:', err)
    throw err
  }
}

const seedEventsTable = async () => {
  const insertQuery = `
  INSERT INTO events (title, datetime, location, description, image_url, attendee_limit, organizer_id, category_id)
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `

  try {
    await Promise.all(
      eventData.map((event) =>
        pool.query(insertQuery, [
          event.title,
          event.datetime,
          event.location,
          event.description,
          event.image_url,
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
    await createProfilesTable()
    await createCategoriesTable()
    await createEventsTable()
    await createEventsArchiveTable()
    await createRsvpsTable()
    await seedUsersTable()
    await seedProfilesTable()
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
