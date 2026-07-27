import { getCategories, getEvents } from '../utils/apiHelpers.js'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

const formatDate = (dateValue) => {
  try {
    return new Date(dateValue).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return dateValue
  }
}

export const Home = ({ isAuthenticated }) => {
  const [categories, setCategories] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const eventsPath = isAuthenticated ? '/events' : '/login'
  const createEventPath = isAuthenticated ? '/events/create' : '/login'

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await getCategories()
        setCategories(categories)
      } catch (error) {
        setCategories([])
      }
    }

    loadCategories()
  }, [])

  useEffect(() => {
    const loadUpcomingEvents = async () => {
      try {
        const events = await getEvents()
        setUpcomingEvents(events.slice(0, 3))
      } catch (error) {
        setUpcomingEvents([])
      }
    }

    loadUpcomingEvents()
  }, [])
  return (
    <>
      <section className='hero'>
        <div className='hero-copy'>
          <h1>Discover events. Meet people. Build community.</h1>
          <p>Find local events that match your interests and connect with people around you.</p>
          <div className='hero-actions'>
            <Link to={eventsPath} className='btn btn-primary'>
              Browse Events
            </Link>
            <Link to={createEventPath} className='btn btn-secondary'>
              Host an Event
            </Link>
          </div>
        </div>

        <div className='hero-art' aria-hidden='true'></div>
      </section>

      <section id='upcoming-events' className='section'>
        <div className='section-header'>
          <h2>Upcoming Events</h2>
          <Link to={eventsPath}>View all</Link>
        </div>

        <div className='event-grid'>
          {upcomingEvents.map((event) => (
            <article key={event.id} className='event-card'>
              <div className='event-image indigo'></div>
              <h3>{event.title}</h3>
              <p>{formatDate(event.datetime)}</p>
              <p>{event.location}</p>
              <span>{event.attendee_limit ? `${event.attendee_limit} seats` : 'Open invite'}</span>
            </article>
          ))}
        </div>
      </section>

      <section className='section'>
        <h2>Popular Categories</h2>
        <div className='category-list'>
          <button className='category-pill category-pill active'>All</button>
          {categories.map((category, index) => (
            <button key={category.id} className='category-pill' data-id={category.id}>
              {category.name}
            </button>
          ))}
        </div>
      </section>

      <section id='about' className='about section'>
        <h2>About Unify</h2>
        <p>
          Unify helps communities discover meaningful local events, share experiences, and grow
          together one meetup at a time.
        </p>
      </section>
    </>
  )
}
