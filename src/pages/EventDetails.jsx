import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getEventById } from '../utils/apiHelpers'
import { getSavedUser } from '../utils/authClient'

export const EventDetails = () => {
  const { id } = useParams()

  const [event, setEvent] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setError('')
        const eventData = await getEventById(id)
        setEvent(eventData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadEvent()
  }, [id])

  if (loading) {
    return (
      <section className='event-details-page'>
        <div className='event-details-shell'>Loading event details...</div>
      </section>
    )
  }

  if (error && !event.title) {
    return (
      <section className='event-details-page'>
        <div className='event-details-shell'>
          <p className='browse-error'>{error}</p>
        </div>
      </section>
    )
  }

  return (
    <>
      <article className='event-details-page'>
        <div className='event-details-shell'>
          <a href='/events' className='event-back-link'>
            ⬅ Back to Events
          </a>

          <div className='event-details-sections'>
            <section className='event-details-section info'>
              <div className='event-details-card-image' />

              <span className='event-details-heading'>
                <h1>{event.title}</h1>
                <div className='category'>{event.category_name}</div>
                <div className='date-time-location'>
                  <p>📅 {new Date(event.datetime).toLocaleDateString()}</p>
                  <p>🕐 {new Date(event.datetime).toLocaleTimeString()}</p>
                  <p>📍 {event.location}</p>
                </div>
              </span>

              <span className='event-details-description'>
                <h3>About this event</h3>
                <p>{event.description}</p>
              </span>

              <span className='event-details-host'>
                <h3>Hosted by</h3>
                <div className='host-container'>
                  <div className='host'>
                    {event.organizer?.avatar_url ? (
                      <img
                        src={event.organizer.avatar_url}
                        alt={`${event.organizer?.first_name} ${event.organizer?.last_name}`}
                      />
                    ) : (
                      <div className='host-avatar'></div>
                    )}
                    {event.organizer && (
                      <span className='host-name'>
                        <h4>{`${event.organizer?.first_name} ${event.organizer?.last_name}`}</h4>
                        <p>Organizer</p>
                      </span>
                    )}
                  </div>
                  <button type='button'>
                    <Link to='/profile'>View Profile</Link>
                  </button>
                </div>
              </span>

              <span className='event-details-attendees'>
                <div className='attendees-heading'>
                  <h3>Attendees (10)</h3>
                  <Link to='/'>View All</Link>
                </div>
                <div className='attendees-avatars'>
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((_, i) => (
                    <div key={i} className='attendee-avatar'></div>
                  ))}
                </div>
              </span>
            </section>

            <section className='event-details-section rsvp'>
              <h5 className='rsvp-heading'>RSVP</h5>
              <div className='rsvp-text'>
                <span>✔</span>
                <h4>You're Going!</h4>
              </div>
              <button type='button' className='rsvp-button'>
                Cancel RSVP
              </button>
            </section>
          </div>
        </div>
      </article>
    </>
  )
}
