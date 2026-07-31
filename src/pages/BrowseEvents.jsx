import { getEvents } from '../utils/apiHelpers.js'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

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
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date_asc')
  const [showFilters, setShowFilters] = useState(false)
  const [pageSize, setPageSize] = useState(() => {
    if (typeof window === 'undefined') {
      return 6
    }

    return Math.max(4, Math.min(12, Math.ceil((window.innerHeight - 220) / 120)))
  })
  const [visibleCount, setVisibleCount] = useState(pageSize)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const loadMoreSentinelRef = useRef(null)

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setError('')
        const events = await getEvents()
        setEvents(events)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [])

  useEffect(() => {
    const onResize = () => {
      const nextPageSize = Math.max(4, Math.min(12, Math.ceil((window.innerHeight - 220) / 120)))
      setPageSize(nextPageSize)
    }

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        events
          .map((event) => String(event.category_name || '').trim())
          .filter(Boolean),
      ),
    ).sort((left, right) => left.localeCompare(right))
  }, [events])

  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const now = new Date()

    const matchesDateFilter = (eventDateValue) => {
      if (dateFilter === 'all') {
        return true
      }

      const eventDate = new Date(eventDateValue)

      if (Number.isNaN(eventDate.getTime())) {
        return false
      }

      if (dateFilter === 'upcoming') {
        return eventDate >= now
      }

      if (dateFilter === 'today') {
        return eventDate.toDateString() === now.toDateString()
      }

      if (dateFilter === 'this_week') {
        const endOfWeek = new Date(now)
        endOfWeek.setDate(now.getDate() + 7)
        return eventDate >= now && eventDate <= endOfWeek
      }

      if (dateFilter === 'this_month') {
        return (
          eventDate.getMonth() === now.getMonth() &&
          eventDate.getFullYear() === now.getFullYear()
        )
      }

      return true
    }

    const matchesCategoryFilter = (eventCategory) => {
      if (categoryFilter === 'all') {
        return true
      }

      return String(eventCategory || '').trim() === categoryFilter
    }

    const nextEvents = events.filter((event) => {
      const title = String(event.title || '').toLowerCase()
      const location = String(event.location || '').toLowerCase()
      const description = String(event.description || '').toLowerCase()
      const categoryName = String(event.category_name || '').toLowerCase()

      const matchesQuery = !normalizedQuery ||
        title.includes(normalizedQuery) ||
        location.includes(normalizedQuery) ||
        description.includes(normalizedQuery) ||
        categoryName.includes(normalizedQuery)

      return (
        matchesQuery &&
        matchesCategoryFilter(event.category_name) &&
        matchesDateFilter(event.datetime)
      )
    })

    nextEvents.sort((left, right) => {
      if (sortBy === 'date_desc') {
        return new Date(right.datetime) - new Date(left.datetime)
      }

      if (sortBy === 'going_desc') {
        return Number(right.attending_count || 0) - Number(left.attending_count || 0)
      }

      if (sortBy === 'title_asc') {
        return String(left.title || '').localeCompare(String(right.title || ''))
      }

      return new Date(left.datetime) - new Date(right.datetime)
    })

    return nextEvents
  }, [events, query, categoryFilter, dateFilter, sortBy])

  useEffect(() => {
    setVisibleCount(pageSize)
  }, [query, categoryFilter, dateFilter, sortBy, pageSize])

  const hasMoreEvents = visibleCount < filteredEvents.length

  const loadMoreEvents = () => {
    setVisibleCount((current) => Math.min(current + pageSize, filteredEvents.length))
  }

  useEffect(() => {
    const sentinel = loadMoreSentinelRef.current

    if (!sentinel || !hasMoreEvents) {
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          loadMoreEvents()
        }
      },
      { rootMargin: '180px 0px' },
    )

    observer.observe(sentinel)

    return () => observer.disconnect()
  }, [hasMoreEvents, filteredEvents.length, pageSize])

  const visibleEvents = filteredEvents.slice(0, visibleCount)

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

          <button
            type='button'
            className='browse-filter-toggle'
            onClick={() => setShowFilters(true)}
          >
            Filters
          </button>
        </div>

        {showFilters && (
          <>
            <button
              type='button'
              className='browse-filter-backdrop'
              onClick={() => setShowFilters(false)}
              aria-label='Close filters'
            />

            <aside className='browse-filter-drawer' aria-label='Event filters'>
              <div className='browse-filter-head'>
                <h3>Filters</h3>
                <button type='button' onClick={() => setShowFilters(false)}>Close</button>
              </div>

              <label htmlFor='categoryFilter'>Category</label>
              <select
                id='categoryFilter'
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
              >
                <option value='all'>All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <label htmlFor='dateFilter'>Date</label>
              <select
                id='dateFilter'
                value={dateFilter}
                onChange={(event) => setDateFilter(event.target.value)}
              >
                <option value='all'>All Dates</option>
                <option value='upcoming'>Upcoming</option>
                <option value='today'>Today</option>
                <option value='this_week'>This Week</option>
                <option value='this_month'>This Month</option>
              </select>

              <label htmlFor='sortBy'>Sort By</label>
              <select
                id='sortBy'
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
              >
                <option value='date_asc'>Date: Soonest</option>
                <option value='date_desc'>Date: Latest</option>
                <option value='going_desc'>Most Going</option>
                <option value='title_asc'>Title: A-Z</option>
              </select>
            </aside>
          </>
        )}

        {loading && <p className='browse-note'>Loading events...</p>}
        {error && <p className='browse-error'>{error}</p>}

        {!loading && !error && (
          <div className='browse-list'>
            {filteredEvents.length === 0 && <p className='browse-note'>No events found.</p>}

            {visibleEvents.map((event) => (
              <article key={event.id} className='browse-card'>
                <div className='browse-card-image'>
                  {event.image_url ? <img src={event.image_url} alt={event.title} /> : null}
                </div>
                <div className='browse-card-content'>
                  <h3>{event.title}</h3>
                  <p>
                    {event.location} · {formatDate(event.datetime)}
                  </p>
                  <div className='browse-card-meta'>
                    <span className='browse-tag'>{event.category_name || 'Community'}</span>
                    <span className='browse-going'>👥 {Number(event.attending_count || 0)} Going</span>
                  </div>
                </div>
                <button type='button' className='browse-card-link'>
                  <Link to={`/events/${event.id}`}>
                    View Details
                  </Link>
                </button>
              </article>
            ))}

            {hasMoreEvents && (
              <button type='button' className='browse-load-more' onClick={loadMoreEvents}>
                Load More
              </button>
            )}

            <div ref={loadMoreSentinelRef} className='browse-scroll-sentinel' aria-hidden='true' />
          </div>
        )}
      </div>
    </section>
  )
}
