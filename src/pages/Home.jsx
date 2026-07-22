import { Link } from 'react-router-dom'

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

const categories = ['All', 'Technology', 'Sports', 'Music', 'Food', 'Fitness', 'Art']

export const Home = () => {
  return (
    <>
      <section className='hero'>
        <div className='hero-copy'>
          <h1>Discover events. Meet people. Build community.</h1>
          <p>
            Find local events that match your interests and connect with people around
            you.
          </p>
          <div className='hero-actions'>
            <a href='#featured-events' className='btn btn-primary'>
              Browse Events
            </a>
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
          {categories.map((category, index) => (
            <button
              key={category}
              type='button'
              className={index === 0 ? 'category-pill active' : 'category-pill'}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <section id='about' className='about section'>
        <h2>About Unify</h2>
        <p>
          Unify helps communities discover meaningful local events, share experiences,
          and grow together one meetup at a time.
        </p>
      </section>
    </>
  )
}
