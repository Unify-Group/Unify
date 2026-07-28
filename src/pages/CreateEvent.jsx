import { createEvent, getCategories } from '../utils/apiHelpers.js'
import { useState, useEffect } from 'react'

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

export const CreateEvent = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    datetime: '',
    location: '',
    attendee_limit: '',
    category: '',
  })

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await getCategories()
        setCategories(categories)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSaving(true)

    try {
      await createEvent({
        title: formData.title,
        description: formData.description,
        datetime: formData.datetime,
        location: formData.location,
        attendee_limit: formData.attendee_limit ? Number(formData.attendee_limit) : null,
        category_id: formData.category || null,
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <section className='event-form-page'>
        <div className='event-form-shell'>Loading event form...</div>
      </section>
    )
  }

  return (
    <form className='event-form' onSubmit={handleSubmit}>
      <h1>Create New Event</h1>
      <fieldset>
        <label htmlFor='title'>Event Title</label>
        <input
          type='text'
          id='title'
          name='title'
          value={formData.title}
          onChange={handleChange}
          maxLength={80}
          placeholder='Enter event title'
          required
        />

        <label htmlFor='category'>Category (optional)</label>
        <select
          name='category'
          id='category'
          value={formData.category}
          onChange={handleChange}
          defaultValue=''
        >
          <option value=''>Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <label htmlFor='attendee_limit'>Capacity (optional)</label>
        <input
          type='number'
          id='attendee_limit'
          name='attendee_limit'
          value={formData.attendee_limit}
          onChange={handleChange}
          min={1}
          placeholder='Enter capacity'
        />

        <label htmlFor='datetime'>Date & Time</label>
        <input
          type='datetime-local'
          id='datetime'
          name='datetime'
          value={formData.datetime}
          onChange={handleChange}
          min={getCurrentMinDateTime()}
          required
        />

        <label htmlFor='location'>Location</label>
        <input
          type='text'
          id='location'
          name='location'
          value={formData.location}
          onChange={handleChange}
          maxLength={255}
          placeholder='Enter location'
          required
        />

        <label htmlFor='description'>Description</label>
        <textarea
          id='description'
          name='description'
          value={formData.description}
          onChange={handleChange}
          rows={4}
          placeholder='Tell people about your event...'
          required
        ></textarea>
      </fieldset>

      {error && <p className='auth-error'>{error}</p>}

      <div className='form-buttons'>
        <button type='submit' className='btn btn-primary' disabled={saving}>
          {saving ? 'Creating...' : 'Create Event'}
        </button>
        <button
          type='button'
          className='btn btn-secondary'
          onClick={() => window.history.back()}
          disabled={saving}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
