const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'

export const CreateEvent = () => {
  const createEvent = async (eventData) => {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventData),
    }

    await fetch(`${API_BASE_URL}/api/events`, options)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)

    const eventData = {
      title: formData.get('title'),
      description: formData.get('description'),
      datetime: formData.get('datetime'),
      location: formData.get('location'),
      attendee_limit: formData.get('attendee_limit') || null,
      category_id: formData.get('category') || null,
    }

    createEvent(eventData)
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
          maxLength={80}
          placeholder='Enter event title'
          required
        />

        <label htmlFor='category'>Category (optional)</label>
        <select name='category' id='category' defaultValue=''>
          <option value=''>Select a category</option>
        </select>

        <label htmlFor='attendee_limit'>Capacity (optional)</label>
        <input
          type='number'
          id='attendee_limit'
          name='attendee_limit'
          min={1}
          placeholder='Enter capacity'
        />

        <label htmlFor='datetime'>Date & Time</label>
        <input type='datetime-local' id='datetime' name='datetime' required />

        <label htmlFor='location'>Location</label>
        <input
          type='text'
          id='location'
          name='location'
          maxLength={255}
          placeholder='Enter location'
          required
        />

        <label htmlFor='description'>Description</label>
        <textarea
          id='description'
          name='description'
          rows={4}
          placeholder='Tell people about your event...'
          required
        ></textarea>
      </fieldset>

      <div className='form-buttons'>
        <button type='submit' className='btn btn-primary'>
          Create Event
        </button>
        <button type='button' className='btn btn-secondary' onClick={() => window.history.back()}>
          Cancel
        </button>
      </div>
    </form>
  )
}
