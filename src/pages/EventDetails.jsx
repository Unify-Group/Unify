import React, { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { getEventById, getMyRsvp, getEventAttendees, createRsvp, deleteRsvp } from '../utils/apiHelpers'
import { getSavedUser } from '../utils/authClient'
import { Spinner } from '../components/Spinner'
import { useToast } from '../components/ToastProvider'
import { resolveEventImage } from '../utils/eventImages.js'

const toSafeDate = (dateValue) => {
  const date = new Date(dateValue)
  return Number.isNaN(date.getTime()) ? null : date
}

export const EventDetails = () => {
  const { id } = useParams()
  const location = useLocation()
  const { showToast } = useToast()

  const [event, setEvent] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isRsvped, setIsRsvped] = useState(false)
  const [attendees, setAttendees] = useState([])
  const [showRsvpModal, setShowRsvpModal] = useState(false)
  const rsvpTriggerRef = useRef(null)
  const modalCloseRef = useRef(null)

  const currentUser = getSavedUser()
  const isOwnEvent = Number(currentUser?.id) === Number(event?.organizer_id)
  const backTo = location.state?.backTo || '/events'
  const backLabel = location.state?.backLabel || 'Back to Events'
  const eventDate = toSafeDate(event.datetime)
  const isPastEvent = Boolean(event?.is_archived) || Boolean(eventDate && eventDate.getTime() < Date.now())

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setError('')
        const eventData = await getEventById(id)
        setEvent(eventData)
      } catch (err) {
        setError(err.message)
        showToast(err.message, 'error')
      } finally {
        setLoading(false)
      }
    }

    loadEvent()
  }, [id, showToast])

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
    if (!currentUser || isOwnEvent || isPastEvent) return
    setShowRsvpModal(true)
  }

  const handleCloseRsvpModal = () => {
    setShowRsvpModal(false)
    // Return focus to the button that opened the modal
    rsvpTriggerRef.current?.focus()
  }

  const handleConfirmRsvp = async () => {
    if (!currentUser) {
      return
    }

    try {
      if (isRsvped) {
        await deleteRsvp(id)
        showToast('RSVP canceled.', 'info')
      } else {
        await createRsvp(id)
        showToast('You are now attending this event.', 'success')
      }

      setIsRsvped(!isRsvped)
      setAttendees(await getEventAttendees(id))
    } catch (err) {
      setError(err.message)
      showToast(err.message, 'error')
    }

    setShowRsvpModal(false)
  }

  // Focus the close button when modal opens
  useEffect(() => {
    if (showRsvpModal) modalCloseRef.current?.focus()
  }, [showRsvpModal])

  // Trap focus inside the modal
  const handleModalKeyDown = (e) => {
    if (e.key === 'Escape') { handleCloseRsvpModal(); return }
    if (e.key !== 'Tab') return
    const modal = e.currentTarget
    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
      e.preventDefault()
      ;(e.shiftKey ? last : first).focus()
    }
  }

  const rsvpButtonLabel = isPastEvent
    ? isRsvped
      ? 'You RSVPed (Past Event)'
      : 'RSVP Closed'
    : !currentUser
      ? 'Sign in to RSVP'
      : isOwnEvent
        ? 'You are the organizer'
        : isRsvped
          ? 'Cancel RSVP'
          : 'RSVP for Event'

  const rsvpMessage = isPastEvent
    ? isRsvped
      ? 'You RSVP\'d to this event in the past. RSVP is now closed because the event has passed.'
      : 'You cannot RSVP because this event has passed.'
    : !currentUser
      ? 'Sign in to mark yourself as attending.'
      : isOwnEvent
        ? 'You cannot RSVP to an event you created.'
        : isRsvped
          ? 'You are on the attendee list.'
          : 'Tap below to RSVP for this event.'

  const rsvpHeading = isPastEvent
    ? isRsvped
      ? 'You RSVPed'
      : 'RSVP Closed'
    : isRsvped
      ? "You're Going!"
      : 'Interested in this event?'

  if (loading) {
    return (
      <section className='event-details-page' aria-busy='true' aria-label='Loading event'>
        <div className='event-details-shell'>
          <Spinner centered label='Loading event details...' />
        </div>
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
          <Link to={backTo} replace className='event-back-link'>
            ⬅ {backLabel}
          </Link>

          <div className='event-details-sections'>
            <section className='event-details-section info'>
              <div className='event-details-card-image'>
                <img src={resolveEventImage(event, Number(id) || 0)} alt={event.title} />
              </div>

              <span className='event-details-heading'>
                <h1>{event.title}</h1>
                <div className='category'>{event.category_name}</div>
                <div className='date-time-location'>
                  <p>
                    <span aria-hidden='true'>📅</span>{' '}
                    {eventDate ? (
                      <time dateTime={eventDate.toISOString()}>{eventDate.toLocaleDateString()}</time>
                    ) : (
                      <span>Date to be announced</span>
                    )}
                  </p>
                  <p>
                    <span aria-hidden='true'>🕐</span>{' '}
                    {eventDate ? (
                      <time dateTime={eventDate.toISOString()}>{eventDate.toLocaleTimeString()}</time>
                    ) : (
                      <span>Time to be announced</span>
                    )}
                  </p>
                  <p><span aria-hidden='true'>📍</span> {event.location}</p>
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
                        <h4>
                          <Link
                            to={`/users/${event.organizer_id}`}
                            state={{ backTo: `/events/${id}`, backLabel: 'Back to Event' }}
                          >
                            {`${event.organizer?.first_name} ${event.organizer?.last_name}`}
                          </Link>
                        </h4>
                        <p>Organizer</p>
                      </span>
                    )}
                  </div>
                  <Link
                    className='host-profile-link'
                    to={`/users/${event.organizer_id}`}
                    state={{ backTo: `/events/${id}`, backLabel: 'Back to Event' }}
                  >
                    View Profile
                  </Link>
                </div>
              </span>

            </section>

            <section className='event-details-section rsvp'>
              <h5 className='rsvp-heading'>RSVP</h5>
              <div className='rsvp-text'>
                <span aria-hidden='true' className={!isRsvped ? 'rsvp-icon--inactive' : ''}>{isRsvped ? '✓' : '✕'}</span>
                <span className='sr-only'>{isRsvped ? 'Status: attending' : 'Status: not attending'}</span>
                <h4>{rsvpHeading}</h4>
                <p>{rsvpMessage}</p>
              </div>
              <button
                ref={rsvpTriggerRef}
                type='button'
                className={`rsvp-button ${isRsvped ? 'is-active' : ''}`}
                onClick={handleOpenRsvpModal}
                disabled={!currentUser || isOwnEvent || isPastEvent}
                aria-pressed={isRsvped}
              >
                {rsvpButtonLabel}
              </button>

              <span className='event-details-attendees'>
                <div className='attendees-heading'>
                  <h3>Attendees ({attendees.length})</h3>
                  <Link to={`/events/${id}/attendees`} state={{ backTo: `/events/${id}`, backLabel: 'Back to Event' }}>
                    View All
                  </Link>
                </div>
                <div className='attendees-avatars'>
                  {attendees.map((attendee) =>
                    attendee.avatar_url ? (
                      <Link
                        key={attendee.id}
                        to={`/users/${attendee.id}`}
                        state={{ backTo: `/events/${id}`, backLabel: 'Back to Event' }}
                        aria-label={`View ${attendee.first_name} ${attendee.last_name}'s profile`}
                      >
                        <img
                          className='attendee-avatar'
                          src={attendee.avatar_url}
                          alt={`${attendee.first_name} ${attendee.last_name}`}
                        />
                      </Link>
                    ) : (
                      <Link
                        key={attendee.id}
                        to={`/users/${attendee.id}`}
                        state={{ backTo: `/events/${id}`, backLabel: 'Back to Event' }}
                        className='attendee-avatar'
                        aria-label={`View ${attendee.first_name} ${attendee.last_name}'s profile`}
                      />
                    ),
                  )}
                </div>
              </span>
            </section>
          </div>
        </div>
      </article>

      {showRsvpModal && (
        <div
          className='rsvp-modal-backdrop'
          role='dialog'
          aria-modal='true'
          aria-labelledby='rsvp-modal-title'
          onClick={handleCloseRsvpModal}
        >
          <div className='rsvp-modal-card' onClick={(e) => e.stopPropagation()} onKeyDown={handleModalKeyDown}>
            <div className='rsvp-modal-header'>
              <h3 id='rsvp-modal-title'>RSVP to {event.title || 'Event'}</h3>
              <button ref={modalCloseRef} className='rsvp-modal-close' onClick={handleCloseRsvpModal} aria-label='Close RSVP dialog'>✕</button>
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
