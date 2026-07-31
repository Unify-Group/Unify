import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { fetchDashboardData, getSavedUser } from '../utils/authClient'

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
  const interests = String(user?.profile?.interests || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

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

  const recentActivity = upNextEvent
    ? [
        attendingEvents[0]
          ? `You're attending ${attendingEvents[0].title}`
          : `You're hosting ${upNextEvent.title}`,
        hostedEvents[0]
          ? `${hostedEvents[0].title} is one of your hosted events`
          : `${dashboardStats.connectionsCount} connections overlap with your events`,
        interests.length > 0
          ? `Recommendations are tuned to ${interests.slice(0, 2).join(' and ')}`
          : 'Recommendations are based on your current activity',
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
            <p>{heroMessage}</p>
            {interests.length > 0 && (
              <div className='dashboard-interest-list'>
                {interests.map((interest) => (
                  <span key={interest} className='dashboard-interest-pill'>
                    {interest}
                  </span>
                ))}
              </div>
            )}
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

        <div className='dashboard-stats'>
          {statCards.map((item) => (
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
            <div className='dashboard-upnext-art'>
              {upNextEvent?.image_url ? <img src={upNextEvent.image_url} alt={upNextEvent.title} /> : null}
            </div>
            <div className='dashboard-upnext-copy'>
              <h3>{upNextEvent?.title || 'No upcoming events yet'}</h3>
              <p>
                {upNextEvent
                  ? `${formatDate(upNextEvent.datetime)} · ${upNextEvent.location}`
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
                <div className={`event-image ${index % 2 === 0 ? 'indigo' : 'orange'}`}>
                  {event.image_url ? <img src={event.image_url} alt={event.title} /> : null}
                </div>
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