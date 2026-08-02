import { createEvent, getCategories } from '../utils/apiHelpers.js'
import { useState, useEffect } from 'react'
import { resizeImageFile } from '../utils/imageUpload.js'
import { Spinner } from '../components/Spinner'
import { useToast } from '../components/ToastProvider'

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
  const { showToast } = useToast()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    datetime: '',
    location: '',
    attendee_limit: '',
    category: '',
    image_url: '',
    image_file_name: '',
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
        showToast(err.message, 'error')
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [showToast])

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageFileChange = (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setError('')

    resizeImageFile(file)
      .then((imageDataUrl) => {
        setFormData((current) => ({
          ...current,
          image_url: imageDataUrl,
          image_file_name: file.name,
        }))
      })
      .catch((err) => {
        setError(err.message)
        showToast(err.message, 'error')
      })
  }

  const handleRemoveImage = () => {
    setFormData((current) => ({
      ...current,
      image_url: '',
      image_file_name: '',
    }))
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
        image_url: formData.image_url || null,
      })

      setFormData({
        title: '',
        description: '',
        datetime: '',
        location: '',
        attendee_limit: '',
        category: '',
        image_url: '',
        image_file_name: '',
      })
      showToast('Event created successfully.', 'success')
    } catch (err) {
      setError(err.message)
      showToast(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <section className='event-form-page'>
        <div className='event-form-shell'>
          <Spinner centered label='Loading event form...' />
        </div>
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

        <label>Event Image (optional)</label>
        <div className='event-image-upload'>
          <div className='event-image-upload-preview'>
            {formData.image_url ? (
              <img src={formData.image_url} alt='Event preview' />
            ) : (
              <span>No image selected</span>
            )}
          </div>

          <div className='event-image-upload-controls'>
            <label htmlFor='event_image_file' className='event-upload-btn'>
              {formData.image_url ? 'Choose New Image' : 'Upload Image'}
            </label>

            {formData.image_url && (
              <button type='button' className='event-remove-image-btn' onClick={handleRemoveImage}>
                Remove Image
              </button>
            )}

            <input
              id='event_image_file'
              name='event_image_file'
              type='file'
              accept='image/*'
              onChange={handleImageFileChange}
            />

            <p className='event-upload-note'>Choose an image from your phone or computer.</p>
            {formData.image_file_name && <p className='event-upload-name'>{formData.image_file_name}</p>}

            <label htmlFor='image_url'>Or paste an image URL</label>
            <input
              id='image_url'
              name='image_url'
              value={formData.image_url}
              onChange={handleChange}
              placeholder='https://example.com/event-image.jpg'
            />
          </div>
        </div>

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
