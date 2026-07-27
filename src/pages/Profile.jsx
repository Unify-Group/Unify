import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { fetchDashboardData, updateCurrentUserProfile } from '../utils/authClient'

const IDENTITY_OPTIONS = [
  'Community Member',
  'Student',
  'Teacher',
  'Gamer',
  'Organizer',
  'DJ',
  'Club Creator',
  'Developer',
  'Artist',
  'Volunteer',
  'Founder',
  'Mentor',
]

const formatDate = (dateValue) => {
  try {
    return new Date(dateValue).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return dateValue
  }
}

const formatShortDate = (dateValue) => {
  try {
    return new Date(dateValue).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateValue
  }
}

export const Profile = () => {
  const [dashboard, setDashboard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    avatar_url: '',
    pronouns: '',
    interests: '',
    identity_labels: [],
    custom_identity_labels: '',
    avatar_file_name: '',
  })

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const payload = await fetchDashboardData()
        setDashboard(payload)
        const user = payload.user
        const identityLabels = String(user?.profile?.identity_labels || '')
          .split(',')
          .map((value) => value.trim())
          .filter(Boolean)

        setForm({
          first_name: user?.first_name || '',
          last_name: user?.last_name || '',
          bio: user?.profile?.bio || '',
          avatar_url: user?.profile?.avatar_url || user?.avatar_url || '',
          pronouns: user?.profile?.pronouns || '',
          interests: user?.profile?.interests || '',
          identity_labels: identityLabels.filter((label) => IDENTITY_OPTIONS.includes(label)),
          custom_identity_labels: identityLabels.filter((label) => !IDENTITY_OPTIONS.includes(label)).join(', '),
          avatar_file_name: '',
        })
      } catch (err) {
        setDashboard(null)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const user = dashboard?.user
  const hostedEvents = dashboard?.hostedEvents || []
  const attendingEvents = dashboard?.attendingEvents || []
  const interests = String(user?.profile?.interests || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
  const identityLabels = String(user?.profile?.identity_labels || '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
  const isOrganizer = hostedEvents.length > 0

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleIdentityToggle = (label) => {
    setForm((current) => ({
      ...current,
      identity_labels: current.identity_labels.includes(label)
        ? current.identity_labels.filter((item) => item !== label)
        : [...current.identity_labels, label],
    }))
  }

  const resizeImageFile = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onerror = () => reject(new Error('Could not read that image file.'))
      reader.onload = () => {
        const image = new Image()

        image.onerror = () => reject(new Error('Could not process that image file.'))
        image.onload = () => {
          const maxSize = 720
          const scale = Math.min(1, maxSize / Math.max(image.width, image.height))
          const width = Math.max(1, Math.round(image.width * scale))
          const height = Math.max(1, Math.round(image.height * scale))
          const canvas = document.createElement('canvas')
          const context = canvas.getContext('2d')

          if (!context) {
            reject(new Error('Could not prepare image editing.'))
            return
          }

          canvas.width = width
          canvas.height = height
          context.drawImage(image, 0, 0, width, height)
          resolve(canvas.toDataURL('image/jpeg', 0.82))
        }

        image.src = typeof reader.result === 'string' ? reader.result : ''
      }

      reader.readAsDataURL(file)
    })

  const handleAvatarFileChange = (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setError('')

    resizeImageFile(file)
      .then((imageDataUrl) => {
        setForm((current) => ({
          ...current,
          avatar_url: imageDataUrl,
          avatar_file_name: file.name,
        }))
      })
      .catch((err) => {
        setError(err.message)
      })
  }

  const handleRemovePhoto = () => {
    setForm((current) => ({
      ...current,
      avatar_url: '',
      avatar_file_name: '',
    }))
  }

  const handleSaveProfile = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')

    try {
      const customLabels = form.custom_identity_labels
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)

      const updatedUser = await updateCurrentUserProfile({
        first_name: form.first_name,
        last_name: form.last_name,
        bio: form.bio,
        avatar_url: form.avatar_url,
        pronouns: form.pronouns,
        interests: form.interests,
        identity_labels: [...form.identity_labels, ...customLabels],
      })

      setDashboard((current) => ({
        ...current,
        user: updatedUser,
      }))
      setIsEditing(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className='profile-page'>
      <div className='profile-shell'>
        <section className='profile-hero'>
          <div className='profile-hero-main'>
            <div className='profile-avatar'>
              {user?.profile?.avatar_url ? (
                <img src={user.profile.avatar_url} alt={`${user.first_name} ${user.last_name}`} />
              ) : (
                <span>{user?.first_name?.charAt(0) || 'U'}</span>
              )}
            </div>

            <div className='profile-identity'>
              <h1>
                {user ? `${user.first_name} ${user.last_name}` : 'Your profile'}
              </h1>
              <p className='profile-handle'>@{user?.email?.split('@')[0] || 'member'}</p>
              <p className='profile-bio'>
                {user?.profile?.bio || (loading ? 'Loading profile...' : 'Add a bio to personalize your profile.')}
              </p>
              <div className='profile-meta-row'>
                {user?.profile?.pronouns && <span className='profile-meta-pill'>{user.profile.pronouns}</span>}
                <span className='profile-badge'>{isOrganizer ? 'Organizer' : 'Community Member'}</span>
              </div>
            </div>
          </div>

          <button type='button' className='profile-edit-btn' onClick={() => setIsEditing((current) => !current)}>
            {isEditing ? 'Close Editor' : 'Edit Profile'}
          </button>
        </section>

        {isEditing && (
          <form className='profile-edit-panel' onSubmit={handleSaveProfile}>
            <div className='profile-edit-grid'>
              <div>
                <label htmlFor='first_name'>First Name</label>
                <input id='first_name' name='first_name' value={form.first_name} onChange={handleInputChange} required />
              </div>

              <div>
                <label htmlFor='last_name'>Last Name</label>
                <input id='last_name' name='last_name' value={form.last_name} onChange={handleInputChange} required />
              </div>

              <div className='profile-edit-grid-full'>
                  <label>Profile Picture</label>
                  <div className='profile-photo-editor'>
                    <div className='profile-photo-preview'>
                      {form.avatar_url ? (
                        <img src={form.avatar_url} alt='Profile preview' />
                      ) : (
                        <span>{form.first_name?.charAt(0) || 'U'}</span>
                      )}
                    </div>

                    <div className='profile-photo-controls'>
                      <div className='profile-photo-actions'>
                        <label htmlFor='avatar_file' className='profile-upload-btn'>
                          {form.avatar_url ? 'Choose New Photo' : 'Add Photo'}
                        </label>
                        {form.avatar_url && (
                          <button type='button' className='profile-remove-photo-btn' onClick={handleRemovePhoto}>
                            Delete Profile Picture
                          </button>
                        )}
                      </div>
                      <input
                        id='avatar_file'
                        name='avatar_file'
                        type='file'
                        accept='image/*'
                        onChange={handleAvatarFileChange}
                      />
                      <p className='profile-upload-note'>
                        Choose a photo from your phone or computer. It will be cropped to fit the profile circle.
                      </p>
                      {form.avatar_file_name && <p className='profile-upload-name'>{form.avatar_file_name}</p>}
                      <label htmlFor='avatar_url'>Or paste an image URL</label>
                      <input
                        id='avatar_url'
                        name='avatar_url'
                        value={form.avatar_url}
                        onChange={handleInputChange}
                        placeholder='https://example.com/your-photo.jpg'
                      />
                    </div>
                  </div>
              </div>

              <div>
                <label htmlFor='pronouns'>Pronouns</label>
                <input
                  id='pronouns'
                  name='pronouns'
                  value={form.pronouns}
                  onChange={handleInputChange}
                  placeholder='e.g. He/Him, She/Her, They/Them'
                />
              </div>

              <div>
                <label htmlFor='interests'>Interests</label>
                <input
                  id='interests'
                  name='interests'
                  value={form.interests}
                  onChange={handleInputChange}
                  placeholder='technology, music, gaming'
                />
              </div>

              <div className='profile-edit-grid-full'>
                <label htmlFor='bio'>Bio</label>
                <textarea id='bio' name='bio' rows='4' value={form.bio} onChange={handleInputChange} />
              </div>

              <div className='profile-edit-grid-full'>
                <label>How do you identify?</label>
                <div className='profile-checkbox-grid'>
                  {IDENTITY_OPTIONS.map((label) => (
                    <label key={label} className='profile-checkbox-pill'>
                      <input
                        type='checkbox'
                        checked={form.identity_labels.includes(label)}
                        onChange={() => handleIdentityToggle(label)}
                      />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className='profile-edit-grid-full'>
                <label htmlFor='custom_identity_labels'>Add more identities</label>
                <input
                  id='custom_identity_labels'
                  name='custom_identity_labels'
                  value={form.custom_identity_labels}
                  onChange={handleInputChange}
                  placeholder='Mentor, Streamer, Community Builder'
                />
              </div>
            </div>

            {error && <p className='auth-error'>{error}</p>}

            <div className='profile-edit-actions'>
              <button type='button' className='btn btn-secondary' onClick={() => setIsEditing(false)}>
                Cancel
              </button>
              <button type='submit' className='btn btn-primary' disabled={saving}>
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        )}

        <section className='profile-grid'>
          <aside className='profile-sidebar'>
            <div className='profile-panel'>
              <h2>Interests</h2>
              <div className='profile-pill-list'>
                {interests.map((interest) => (
                  <span key={interest} className='profile-pill'>
                    {interest}
                  </span>
                ))}

                {!interests.length && <p className='profile-empty'>No interests added yet.</p>}
              </div>
            </div>

            <div className='profile-panel'>
              <h2>Identity</h2>
              <div className='profile-pill-list'>
                {identityLabels.map((label) => (
                  <span key={label} className='profile-pill'>
                    {label}
                  </span>
                ))}

                {!identityLabels.length && <p className='profile-empty'>Add the roles that describe you.</p>}
              </div>
            </div>

            <div className='profile-panel'>
              <h2>Become an Organizer</h2>
              <p>Host your own event and bring people together.</p>
              <Link to='/events/create' className='profile-create-btn'>
                Create New Event
              </Link>
            </div>
          </aside>

          <div className='profile-content'>
            <section className='profile-panel'>
              <h2>My Hosted Events</h2>

              <div className='profile-event-table'>
                <div className='profile-event-table-head'>
                  <span>Event</span>
                  <span>Date</span>
                  <span>Cap.</span>
                  <span>Actions</span>
                </div>

                {hostedEvents.map((event) => (
                  <div key={event.id} className='profile-event-row'>
                    <strong>{event.title}</strong>
                    <span>{formatDate(event.datetime)}</span>
                    <span>{event.attendee_limit || 'Open'}</span>
                    <div className='profile-event-actions'>
                      <Link to={`/events/${event.id}/edit`} className='profile-outline-btn'>
                        Edit
                      </Link>
                    </div>
                  </div>
                ))}

                {!hostedEvents.length && <p className='profile-empty'>You haven&apos;t created any events yet.</p>}
              </div>
            </section>

            <section className='profile-panel'>
              <div className='profile-section-head'>
                <h2>Events I&apos;m Attending</h2>
                <Link to='/events'>View all</Link>
              </div>

              <div className='profile-attending-grid'>
                {attendingEvents.map((event, index) => (
                  <article key={event.id} className='profile-attending-card'>
                    <div className={`event-image ${index % 2 === 0 ? 'orange' : 'indigo'}`}></div>
                    <h3>
                      {event.title} <span> - {formatShortDate(event.datetime)}</span>
                    </h3>
                  </article>
                ))}

                {!attendingEvents.length && <p className='profile-empty'>You are not attending any events yet.</p>}
              </div>
            </section>
          </div>
        </section>
      </div>
    </section>
  )
}
