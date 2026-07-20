import { pool } from './db.js'
import './dotenv.js'
import categoryData from './data/categories.js'

const createUsersTable = async () => {
  const createTableQuery = `
        DROP TABLE IF EXISTS users CASCADE;

        CREATE TABLE users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            bio TEXT,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
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
        );
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
        VALUES ($1);
    `

  try {
    await Promise.all(categoryData.map((category) => pool.query(insertQuery, [category.name])))
    console.log('✅ categories seeded successfully')
  } catch (err) {
    console.error('⚠️ error inserting categories:', err)
    throw err
  }
}

const createEventsTable = async () => {
  const createTableQuery = `
        DROP TABLE IF EXISTS events CASCADE;

        CREATE TABLE events (
            id SERIAL PRIMARY KEY,
            host_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            category_id INT REFERENCES categories(id) ON DELETE SET NULL,
            title VARCHAR(150) NOT NULL,
            details TEXT,
            event_date TIMESTAMPTZ NOT NULL,
            location VARCHAR(255) NOT NULL,
            max_capacity INT CHECK (max_capacity > 0),
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
    `
  try {
    await pool.query(createTableQuery)
    console.log('✅ events table created successfully')
  } catch (err) {
    console.error('❌ error creating events table:', err)
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
        );
    `
  try {
    await pool.query(createTableQuery)
    console.log('✅ rsvps table created successfully')
  } catch (err) {
    console.error('❌ error creating rsvps table:', err)
    throw err
  }
}

const resetDb = async () => {
  try {
    await createUsersTable()
    await createCategoriesTable()
    await seedCategoriesTable()
    await createEventsTable()
    await createRsvpsTable()
    console.log('🎉 database reset complete')
  } catch (err) {
    console.error('❌ database reset failed:', err)
  } finally {
    await pool.end()
  }
}

resetDb()
