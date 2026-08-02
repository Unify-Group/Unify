import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { getPublicUserProfile } from '../utils/apiHelpers'

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

const yearsLabel = (years) => {
  if (years === 1) {
    return '1 yr'
  }

  return `${years} yrs`
}

export const PublicProfile = () => {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setError('')
        const payload = await getPublicUserProfile(id)
        setProfile(payload)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [id])

  const user = profile?.user
  const stats = profile?.stats || {
    eventsHosted: 0,
    totalAttendees: 0,
    yearsOrganizing: 0,
  }
  const hostedEvents = profile?.hostedEvents || []
  const backTo = location.state?.backTo
  const backLabel = location.state?.backLabel || 'Back'

  const interests = useMemo(
    () =>
      String(user?.interests || '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
    [user?.interests],
  )

  const handle = String(user?.email || '').split('@')[0] || 'organizer'
  const displayName = user ? `${user.first_name} ${user.last_name}` : 'Public Profile'

  if (loading) {
    return (
      <section className='public-profile-page'>
        <div className='public-profile-shell'>Loading profile...</div>
      </section>
    )
  }

  if (error || !user) {
    return (
      <section className='public-profile-page'>
        <div className='public-profile-shell'>
          <p className='browse-error'>{error || 'Unable to load profile.'}</p>
        </div>
      </section>
    )
  }

  return (
    <section className='public-profile-page'>
      <div className='public-profile-shell'>
        {backTo ? (
          <Link to={backTo} className='public-profile-back'>
            {backLabel}
          </Link>
        ) : (
          <button type='button' className='public-profile-back' onClick={() => navigate(-1)}>
            Back
          </button>
        )}

        <section className='public-profile-hero'>
          <div className='public-profile-banner'></div>

          <div className='public-profile-identity'>
            <div className='public-profile-avatar'>
              {user.avatar_url ? (
                <img src={user.avatar_url} alt={displayName} />
              ) : (
                <span>{user.first_name?.charAt(0) || 'U'}</span>
              )}
            </div>

            <div className='public-profile-copy'>
              <h1>{displayName}</h1>
              <p>@{handle}</p>
              <span className='public-profile-badge'>Organizer</span>
            </div>
          </div>
        </section>

        <section className='public-profile-summary'>
          <p className='public-profile-bio'>
            {user.bio || 'Community organizer bringing people together through events.'}
          </p>

          <div className='public-profile-stats'>
            <article>
              <strong>{stats.eventsHosted}</strong>
              <span>Events Hosted</span>
            </article>
            <article>
              <strong>{stats.totalAttendees}</strong>
              <span>Total Attendees</span>
            </article>
            <article>
              <strong>{yearsLabel(stats.yearsOrganizing)}</strong>
              <span>Organizing Since</span>
            </article>
          </div>

          <div className='public-profile-divider'></div>

          <h2>Interests</h2>
          <div className='public-profile-interests'>
            {interests.length > 0 ? (
              interests.map((interest) => (
                <span key={interest}>{interest}</span>
              ))
            ) : (
              <p className='profile-empty'>No public interests shared yet.</p>
            )}
          </div>
        </section>

        <section className='public-profile-events'>
          <h2>Events Hosted by {user.first_name}</h2>
          <p>Public events this organizer is hosting or has hosted.</p>

          <div className='public-profile-event-grid'>
            {hostedEvents.map((event, index) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                replace
                state={{ backTo: `/users/${user.id}`, backLabel: `Back to ${displayName}` }}
                className='public-profile-event-card'
              >
                <div className={`event-image ${index % 2 === 0 ? 'indigo' : 'orange'}`}>
                  {event.image_url ? <img src={event.image_url} alt={event.title} /> : null}
                </div>
                <h3>{event.title}</h3>
                <p>{formatDate(event.datetime)}</p>
                <span>{event.attending_count} Going</span>
              </Link>
            ))}

            {!hostedEvents.length && <p className='profile-empty'>No hosted events yet.</p>}
          </div>
        </section>
      </div>
    </section>
  )
}
