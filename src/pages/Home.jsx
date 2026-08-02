import { getCategories, getEvents } from '../utils/apiHelpers.js'
import { Link } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { getLandingSlideshowImages, resolveEventImage } from '../utils/eventImages.js'

const formatDate = (dateValue) => {
  const date = new Date(dateValue)

  if (Number.isNaN(date.getTime())) {
    return 'Date to be announced'
  }

  try {
    return date.toLocaleString(undefined, {
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
  const [heroSlideIndex, setHeroSlideIndex] = useState(0)
  const eventsPath = isAuthenticated ? '/events' : '/login'
  const createEventPath = isAuthenticated ? '/events/create' : '/login'
  const heroImages = useMemo(() => getLandingSlideshowImages(upcomingEvents), [upcomingEvents])

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

  useEffect(() => {
    if (heroImages.length <= 1) {
      return undefined
    }

    const slideTimer = window.setInterval(() => {
      setHeroSlideIndex((current) => (current + 1) % heroImages.length)
    }, 4500)

    return () => window.clearInterval(slideTimer)
  }, [heroImages])

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

        <div className='hero-art hero-carousel' aria-label='Event photo highlights'>
          {heroImages.map((image, index) => (
            <img
              key={image}
              src={image}
              alt='Community event highlight'
              className={`hero-carousel-image ${index === heroSlideIndex ? 'is-active' : ''}`}
              loading={index === 0 ? 'eager' : 'lazy'}
            />
          ))}
        </div>
      </section>

      <section id='upcoming-events' className='section'>
        <div className='section-header'>
          <h2>Upcoming Events</h2>
          <Link to={eventsPath}>View all</Link>
        </div>

        <div className='event-grid'>
          {upcomingEvents.map((event) => (
            <article key={event.id} className='event-card'>
              <div className='event-image indigo'>
                <img src={resolveEventImage(event, event.id, { preferTitleMatch: true })} alt={event.title} />
              </div>
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
