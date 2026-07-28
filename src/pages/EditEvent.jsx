import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteEvent, getCategories, getEventById, updateEvent } from '../utils/apiHelpers'
import { getSavedUser } from '../utils/authClient'

const toDateInputValue = (dateValue) => {
  try {
    const date = new Date(dateValue)
    const pad = (value) => String(value).padStart(2, '0')

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
  } catch {
    return ''
  }
}

const getCurrentMinDateTime = () => {
  const now = new Date()
  const pad = (value) => String(value).padStart(2, '0')

  const year = now.getFullYear()
  const month = pad(now.getMonth() + 1)
  const day = pad(now.getDate())
  const hours = pad(now.getHours())
  const minutes = pad(now.getMinutes())

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export const EditEvent = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = getSavedUser()
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    datetime: '',
    location: '',
    attendee_limit: '',
    category: '',
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const [event, categoryList] = await Promise.all([getEventById(id), getCategories()])

        if (Number(event.organizer_id) !== Number(user?.id)) {
          setError('You can only edit events you created.')
          return
        }

        setCategories(categoryList)
        setFormData({
          title: event.title || '',
          description: event.description || '',
          datetime: toDateInputValue(event.datetime),
          location: event.location || '',
          attendee_limit: event.attendee_limit || '',
          category: event.category_id || '',
        })
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id, user?.id])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSaving(true)

    try {
      await updateEvent(id, {
        title: formData.title,
        description: formData.description,
        datetime: formData.datetime,
        location: formData.location,
        attendee_limit: formData.attendee_limit ? Number(formData.attendee_limit) : null,
        category_id: formData.category || null,
      })

      navigate('/profile')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setError('')
    setSaving(true)

    try {
      await deleteEvent(id)
      navigate('/profile')
    } catch (err) {
      setError(err.message)
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <section className='event-form-page'>
        <div className='event-form-shell'>Loading event...</div>
      </section>
    )
  }

  if (error && !formData.title) {
    return (
      <section className='event-form-page'>
        <div className='event-form-shell'>
          <p className='browse-error'>{error}</p>
        </div>
      </section>
    )
  }

  return (
    <section className='event-form-page'>
      <div className='event-form-shell'>
        <div className='event-form-head'>
          <div>
            <Link to='/profile' className='event-back-link'>
              Back to profile
            </Link>
            <h1>Edit Event</h1>
          </div>

          <button
            type='button'
            className='event-delete-link'
            onClick={handleDelete}
            disabled={saving}
          >
            Delete Event
          </button>
        </div>

        <form className='event-form-card' onSubmit={handleSubmit}>
          <div className='event-form-grid'>
            <div>
              <label htmlFor='title'>Event Title</label>
              <input
                id='title'
                name='title'
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor='datetime'>Date & Time</label>
              <input
                id='datetime'
                name='datetime'
                type='datetime-local'
                value={formData.datetime}
                onChange={handleChange}
                min={getCurrentMinDateTime()}
                required
              />
            </div>

            <div>
              <label htmlFor='category'>Category (optional)</label>
              <select
                id='category'
                name='category'
                value={formData.category}
                onChange={handleChange}
              >
                <option value=''>Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor='attendee_limit'>Capacity (optional)</label>
              <input
                id='attendee_limit'
                name='attendee_limit'
                type='number'
                min='1'
                value={formData.attendee_limit}
                onChange={handleChange}
              />
            </div>

            <div className='event-form-grid-full'>
              <label htmlFor='location'>Location</label>
              <input
                id='location'
                name='location'
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className='event-form-grid-full'>
              <label htmlFor='description'>Description</label>
              <textarea
                id='description'
                name='description'
                rows='5'
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {error && <p className='auth-error'>{error}</p>}

          <div className='event-form-actions'>
            <button
              type='button'
              className='btn btn-secondary'
              onClick={() => navigate('/profile')}
            >
              Cancel
            </button>
            <button type='submit' className='btn btn-primary' disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}
