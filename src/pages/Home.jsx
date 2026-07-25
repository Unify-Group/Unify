import { getCategories } from '../utils/apiHelpers.js'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'

const featuredEvents = [
  {
    id: 1,
    title: 'Tech Mixer',
    date: 'May 20 · 6:00 PM',
    location: 'Houston, TX',
    going: 42,
    tone: 'indigo',
  },
  {
    id: 2,
    title: 'Yoga in the Park',
    date: 'May 22 · 9:00 AM',
    location: 'Memorial Park',
    going: 16,
    tone: 'orange',
  },
  {
    id: 3,
    title: 'Game Night',
    date: 'May 24 · 7:00 PM',
    location: 'Midtown',
    going: 28,
    tone: 'indigo',
  },
]

export const Home = () => {
  const [categories, setCategories] = useState([])
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
  return (
    <>
      <section className='hero'>
        <div className='hero-copy'>
          <h1>Discover events. Meet people. Build community.</h1>
          <p>Find local events that match your interests and connect with people around you.</p>
          <div className='hero-actions'>
            <Link to='/events' className='btn btn-primary'>
              Browse Events
            </Link>
            <Link to='/signup' className='btn btn-secondary'>
              Host an Event
            </Link>
          </div>
        </div>

        <div className='hero-art' aria-hidden='true'></div>
      </section>

      <section id='featured-events' className='section'>
        <div className='section-header'>
          <h2>Featured Events</h2>
          <a href='#'>View all</a>
        </div>

        <div className='event-grid'>
          {featuredEvents.map((event) => (
            <article key={event.id} className='event-card'>
              <div className={`event-image ${event.tone}`}></div>
              <h3>{event.title}</h3>
              <p>{event.date}</p>
              <p>{event.location}</p>
              <span>{event.going} Going</span>
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
