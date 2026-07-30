import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getEventById, getMyRsvp, getEventAttendees, createRsvp, deleteRsvp } from '../utils/apiHelpers'
import { getSavedUser } from '../utils/authClient'

export const EventDetails = () => {
  const { id } = useParams()

  const [event, setEvent] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isRsvped, setIsRsvped] = useState(false)
  const [attendees, setAttendees] = useState([])
  const [showRsvpModal, setShowRsvpModal] = useState(false)

  const currentUser = getSavedUser()

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

  useEffect(() => {
    getEventAttendees(id)
      .then(setAttendees)
      .catch(() => setAttendees([]))
  }, [id])

  useEffect(() => {
    if (!currentUser) {
      setIsRsvped(false)
      return
    }

    getMyRsvp(id)
      .then((rsvp) => setIsRsvped(rsvp?.status === 'attending'))
      .catch(() => setIsRsvped(false))
  }, [id, currentUser])

  const handleOpenRsvpModal = () => {
    if (!currentUser) {
      return
    }

    setShowRsvpModal(true)
  }

  const handleCloseRsvpModal = () => {
    setShowRsvpModal(false)
  }

  const handleConfirmRsvp = async () => {
    if (!currentUser) {
      return
    }

    try {
      if (isRsvped) {
        await deleteRsvp(id)
      } else {
        await createRsvp(id)
      }

      setIsRsvped(!isRsvped)
      setAttendees(await getEventAttendees(id))
    } catch (err) {
      setError(err.message)
    }

    setShowRsvpModal(false)
  }

  const rsvpButtonLabel = !currentUser ? 'Sign in to RSVP' : isRsvped ? 'Cancel RSVP' : 'RSVP for Event'
  const rsvpMessage = !currentUser
    ? 'Sign in to mark yourself as attending.'
    : isRsvped
      ? 'You are on the attendee list.'
      : 'Tap below to RSVP for this event.'

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

            </section>

            <section className='event-details-section rsvp'>
              <h5 className='rsvp-heading'>RSVP</h5>
              <div className='rsvp-text'>
                <span className={!isRsvped ? 'rsvp-icon--inactive' : ''}>{isRsvped ? '✓' : '✕'}</span>
                <h4>{isRsvped ? "You're Going!" : 'Interested in this event?'}</h4>
                <p>{rsvpMessage}</p>
              </div>
              <button
                type='button'
                className={`rsvp-button ${isRsvped ? 'is-active' : ''}`}
                onClick={handleOpenRsvpModal}
                disabled={!currentUser}
              >
                {rsvpButtonLabel}
              </button>

              <span className='event-details-attendees'>
                <div className='attendees-heading'>
                  <h3>Attendees ({attendees.length})</h3>
                  <Link to={`/events/${id}/attendees`}>View All</Link>
                </div>
                <div className='attendees-avatars'>
                  {attendees.map((attendee) =>
                    attendee.avatar_url ? (
                      <img
                        key={attendee.id}
                        className='attendee-avatar'
                        src={attendee.avatar_url}
                        alt={`${attendee.first_name} ${attendee.last_name}`}
                      />
                    ) : (
                      <div key={attendee.id} className='attendee-avatar'></div>
                    ),
                  )}
                </div>
              </span>
            </section>
          </div>
        </div>
      </article>

      {showRsvpModal && (
        <div className='rsvp-modal-backdrop' role='dialog' aria-modal='true' onClick={handleCloseRsvpModal}>
          <div className='rsvp-modal-card' onClick={(event) => event.stopPropagation()}>
            <div className='rsvp-modal-header'>
              <h3>RSVP to {event.title || 'Event'}</h3>
              <button className='rsvp-modal-close' onClick={handleCloseRsvpModal} aria-label='Close'>✕</button>
            </div>

            {event.category_name && <div className='rsvp-category-pill'>{event.category_name}</div>}

            <p className='rsvp-modal-text'>
              {isRsvped
                ? `You’re already on the guest list for ${event.title || 'this event'}. Would you like to cancel your RSVP?`
                : `You’re about to RSVP for ${event.title || 'this event'}.`}
            </p>

            <div className='rsvp-modal-actions'>
              <button type='button' className='rsvp-modal-secondary' onClick={handleCloseRsvpModal}>
                Cancel
              </button>
              <button type='button' className='rsvp-modal-primary' onClick={handleConfirmRsvp}>
                {isRsvped ? 'Yes, cancel' : 'Confirm RSVP'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
