import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getEventById, getEventAttendees } from '../utils/apiHelpers'

export const EventAttendees = () => {
  const { id } = useParams()

  const [event, setEvent] = useState({})
  const [attendees, setAttendees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadAttendees = async () => {
      try {
        setError('')
        const [eventData, attendeeData] = await Promise.all([getEventById(id), getEventAttendees(id)])
        setEvent(eventData)
        setAttendees(attendeeData)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadAttendees()
  }, [id])

  return (
    <section className='event-attendees-page'>
      <div className='event-attendees-shell'>
        <Link to={`/events/${id}`} className='event-back-link'>
          ⬅ Back to Event
        </Link>

        <h1>Attendees{event.title ? ` for ${event.title}` : ''}</h1>

        {loading && <p className='browse-note'>Loading attendees...</p>}
        {error && <p className='browse-error'>{error}</p>}

        {!loading && !error && (
          <div className='event-attendees-list'>
            {attendees.length === 0 && <p className='browse-note'>No one has RSVPed yet.</p>}

            {attendees.map((attendee) => (
              <div key={attendee.id} className='event-attendee-row'>
                {attendee.avatar_url ? (
                  <img
                    className='attendee-avatar'
                    src={attendee.avatar_url}
                    alt={`${attendee.first_name} ${attendee.last_name}`}
                  />
                ) : (
                  <div className='attendee-avatar'></div>
                )}
                <span>{`${attendee.first_name} ${attendee.last_name}`}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
