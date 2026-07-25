import { fetchEvents } from '../utils/apiHelpers.js'
import { useEffect, useMemo, useState } from 'react'

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

export const BrowseEvents = () => {
  const [events, setEvents] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setError('')
        const events = await fetchEvents()
        setEvents(events)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [])

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return events
    }

    return events.filter((event) => {
      const title = String(event.title || '').toLowerCase()
      const location = String(event.location || '').toLowerCase()
      const description = String(event.description || '').toLowerCase()

      return (
        title.includes(normalizedQuery) ||
        location.includes(normalizedQuery) ||
        description.includes(normalizedQuery)
      )
    })
  }, [events, query])

  return (
    <section className='browse-page'>
      <div className='browse-shell'>
        <div className='browse-toolbar'>
          <input
            type='search'
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder='Search events...'
          />
        </div>

        {loading && <p className='browse-note'>Loading events...</p>}
        {error && <p className='browse-error'>{error}</p>}

        {!loading && !error && (
          <div className='browse-list'>
            {filteredEvents.length === 0 && <p className='browse-note'>No events found.</p>}

            {filteredEvents.map((event) => (
              <article key={event.id} className='browse-card'>
                <div className='browse-card-image'></div>
                <div className='browse-card-content'>
                  <h3>{event.title}</h3>
                  <p>
                    {event.location} · {formatDate(event.datetime)}
                  </p>
                </div>
                <button type='button'>View Details</button>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
