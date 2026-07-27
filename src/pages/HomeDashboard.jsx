import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getEvents } from '../utils/apiHelpers.js'
import { getSavedUser } from '../utils/authClient'

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

const initialsFromUser = (user) => {
  const first = String(user?.first_name || user?.firstName || '').trim()
  const last = String(user?.last_name || user?.lastName || '').trim()
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || 'U'
}

export const HomeDashboard = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const user = getSavedUser()
  const firstName = user?.first_name || user?.firstName || 'there'

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const payload = await getEvents()
        setEvents(payload)
      } catch {
        setEvents([])
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [])

  const upNextEvent = events[0] || null
  const recommendedEvents = events.slice(0, 4)
  const stats = [
    { label: 'Events Attending', value: Math.min(events.length, 3), tone: 'indigo' },
    { label: 'Events Hosting', value: Math.min(Math.max(events.length - 1, 0), 2), tone: 'orange' },
    { label: 'Connections', value: Math.max(24, events.length * 32), tone: 'green' },
  ]

  const recentActivity = upNextEvent
    ? [
        `${firstName} RSVP'd to ${upNextEvent.title}`,
        `${Math.max(18, events.length * 14)} people are going to ${upNextEvent.title}`,
        `New recommendations are ready based on your recent activity`,
      ]
    : [
        'Your next event activity will show up here.',
        'Invite friends to start building your community.',
        'Recommended events will appear after you join an event.',
      ]

  return (
    <section className='dashboard-page'>
      <div className='dashboard-shell'>
        <div className='dashboard-topbar'>
          <div>
            <h1>Welcome back, {firstName} <span aria-hidden='true'>👋</span></h1>
            <p>Here&apos;s what&apos;s happening in your community.</p>
          </div>

          <div className='dashboard-topbar-actions'>
            <Link to='/events/create' className='create-event-btn'>Create Event</Link>
            <div className='dashboard-avatar' aria-label='Profile avatar'>
              {initialsFromUser(user)}
            </div>
          </div>
        </div>

        <div className='dashboard-stats'>
          {stats.map((item) => (
            <article key={item.label} className='dashboard-stat-card'>
              <div className={`dashboard-stat-badge ${item.tone}`}>{item.value}</div>
              <div>
                <p>{item.label}</p>
                <strong>{item.value}</strong>
              </div>
            </article>
          ))}
        </div>

        <section className='dashboard-section'>
          <div className='dashboard-section-header'>
            <h2>Up Next</h2>
          </div>

          <article className='dashboard-upnext-card'>
            <div className='dashboard-upnext-art'></div>
            <div className='dashboard-upnext-copy'>
              <h3>{upNextEvent?.title || 'No upcoming events yet'}</h3>
              <p>
                {upNextEvent
                  ? `${formatDate(upNextEvent.datetime)} · ${upNextEvent.location}`
                  : loading
                    ? 'Loading your next event...'
                    : 'Join an event to start building your schedule.'}
              </p>
              <span>{upNextEvent ? `You're going` : 'Suggested for you'}</span>
            </div>
            <Link to='/events' className='dashboard-outline-btn'>View Details</Link>
          </article>
        </section>

        <section className='dashboard-section'>
          <div className='dashboard-section-header'>
            <h2>Recommended For You</h2>
            <Link to='/events'>View all</Link>
          </div>

          <div className='dashboard-grid'>
            {recommendedEvents.map((event, index) => (
              <article key={event.id} className='dashboard-event-card'>
                <div className={`event-image ${index % 2 === 0 ? 'indigo' : 'orange'}`}></div>
                <h3>{event.title}</h3>
                <p>{formatDate(event.datetime)}</p>
                <span>{event.category_name || 'Community'}</span>
              </article>
            ))}

            {!recommendedEvents.length && !loading && (
              <p className='dashboard-empty'>No recommendations yet. Check back after more events are posted.</p>
            )}
          </div>
        </section>

        <section className='dashboard-section'>
          <div className='dashboard-section-header'>
            <h2>Recent Activity</h2>
          </div>

          <div className='dashboard-activity-list'>
            {recentActivity.map((item, index) => (
              <article key={`${item}-${index}`} className='dashboard-activity-item'>
                <div className='dashboard-activity-dot'></div>
                <p>{item}</p>
                <span>{index === 0 ? '2h ago' : index === 1 ? '5h ago' : '1d ago'}</span>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}