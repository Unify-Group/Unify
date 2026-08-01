import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { fetchDashboardData, getSavedUser } from '../utils/authClient'
import { buildRecentActivity, parseInterestList } from '../utils/profileUtils'

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

const DASHBOARD_MESSAGES = [
  "Here's what's happening in your community.",
  'Your next great connection starts here.',
  'Fresh events are waiting for you.',
  'Find something fun to join today.',
]

export const HomeDashboard = () => {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const savedUser = getSavedUser()
  const user = dashboard?.user || savedUser
  const firstName = user?.first_name || user?.firstName || 'there'
  const avatarUrl = String(user?.profile?.avatar_url || user?.avatar_url || '').trim()
  const messageSeed = Number(user?.id) || firstName.length || 0
  const messageIndex = (new Date().getDate() + messageSeed) % DASHBOARD_MESSAGES.length
  const heroMessage = DASHBOARD_MESSAGES[messageIndex]
  const interests = parseInterestList(user?.profile?.interests)

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const payload = await fetchDashboardData()
        setDashboard(payload)
      } catch {
        setDashboard(null)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const dashboardStats = dashboard?.stats || {
    attendingCount: 0,
    hostingCount: 0,
    connectionsCount: 0,
  }
  const upNextEvent = dashboard?.upNextEvent || null
  const recommendedEvents = dashboard?.recommendedEvents || []
  const hostedEvents = dashboard?.hostedEvents || []
  const attendingEvents = dashboard?.attendingEvents || []
  const statCards = [
    { label: 'Events Attending', value: dashboardStats.attendingCount, tone: 'indigo' },
    { label: 'Events Hosting', value: dashboardStats.hostingCount, tone: 'orange' },
    { label: 'Connections', value: dashboardStats.connectionsCount, tone: 'green' },
  ]

  const recentActivity = buildRecentActivity({
    attendingEvents,
    hostedEvents,
    interests,
    userCreatedAt: user?.created_at || null,
  })

  return (
    <section className='dashboard-page' aria-label='Home Dashboard'>
      <div className='dashboard-shell'>
        <div className='dashboard-topbar'>
          <div>
            <h1>Welcome back, {firstName} <span aria-hidden='true'>👋</span></h1>
            <p>{heroMessage}</p>
          </div>

          <div className='dashboard-topbar-actions'>
            <Link to='/events/create' className='create-event-btn'>Create Event</Link>
            <div className='dashboard-avatar' aria-label='Profile avatar'>
              {avatarUrl ? (
                <img src={avatarUrl} alt={`${firstName} profile`} />
              ) : (
                initialsFromUser(user)
              )}
            </div>
          </div>
        </div>

        <div className='dashboard-stats' aria-label='Your stats'>
          {statCards.map((item) => (
            <article
              key={item.label}
              className='dashboard-stat-card'
              aria-label={`${item.label}: ${item.value}`}
            >
              <div className={`dashboard-stat-badge ${item.tone}`} aria-hidden='true'>{item.value}</div>
              <div>
                <p>{item.label}</p>
                <strong aria-hidden='true'>{item.value}</strong>
              </div>
            </article>
          ))}
        </div>

        <section className='dashboard-section'>
          <div className='dashboard-section-header'>
            <h2>Up Next</h2>
          </div>

          <article className='dashboard-upnext-card'>
            <div className='dashboard-upnext-art'>
              {upNextEvent?.image_url ? <img src={upNextEvent.image_url} alt={upNextEvent.title} /> : null}
            </div>
            <div className='dashboard-upnext-copy'>
              <h3>{upNextEvent?.title || 'No upcoming events yet'}</h3>
              <p>
                {upNextEvent
                  ? <><time dateTime={upNextEvent.datetime}>{formatDate(upNextEvent.datetime)}</time> · {upNextEvent.location}</>
                  : loading
                    ? 'Loading your next event...'
                    : 'Join an event to start building your schedule.'}
              </p>
              <span>
                {attendingEvents.some((event) => event.id === upNextEvent?.id)
                  ? `You're going`
                  : upNextEvent
                    ? 'You are hosting'
                    : 'Suggested for you'}
              </span>
            </div>
            <Link
              to={upNextEvent ? `/events/${upNextEvent.id}` : '/events'}
              state={upNextEvent ? { backTo: '/home', backLabel: 'Back to Dashboard' } : undefined}
              className='dashboard-outline-btn'
            >
              View Details
            </Link>
          </article>
        </section>

        <section className='dashboard-section'>
          <div className='dashboard-section-header'>
            <h2>Recommended For You</h2>
            <Link to='/events'>View all</Link>
          </div>

          <div className='dashboard-grid'>
            {recommendedEvents.map((event, index) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                state={{ backTo: '/home', backLabel: 'Back to Dashboard' }}
                className='dashboard-event-card'
              >
                <div className={`event-image ${index % 2 === 0 ? 'indigo' : 'orange'}`}>
                  {event.image_url ? <img src={event.image_url} alt={event.title} /> : null}
                </div>
                <h3>{event.title}</h3>
                <p>{formatDate(event.datetime)}</p>
                <span>{event.category_name || 'Community'}</span>
              </Link>
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

          <div className='dashboard-activity-list' aria-label='Recent activity' aria-live='polite'>
            {recentActivity.map((item, index) => (
              <article key={`${item.text}-${index}`} className='dashboard-activity-item'>
                <div className='dashboard-activity-dot' aria-hidden='true'></div>
                <p>{item.text}</p>
                <time className='dashboard-activity-time'>{item.relativeTime}</time>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  )
}