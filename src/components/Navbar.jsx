import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { clearSession } from '../utils/authClient'

export const Navbar = ({ isAuthenticated }) => {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const navRef = useRef(null)
  const homePath = isAuthenticated ? '/home' : '/'
  const eventsPath = isAuthenticated ? '/events' : '/login'
  const profilePath = isAuthenticated ? '/profile' : '/login'
  const createEventPath = isAuthenticated ? '/events/create' : '/login'

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMobileOpen(false)
      }
    }
    if (mobileOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [mobileOpen])

  const closeMenu = () => setMobileOpen(false)

  const handleLogout = () => {
    clearSession()
    closeMenu()
    navigate('/login')
  }

  return (
    <nav className='navbar' ref={navRef}>
      <Link to={homePath} className='brand' onClick={closeMenu}>
        <span className='brand-mark' aria-hidden='true'>
          <span className='dot dot-left'></span>
          <span className='dot dot-right'></span>
        </span>
        <span className='brand-text'>Unify</span>
      </Link>

      <ul className='nav-links'>
        <li>
          <NavLink
            to={homePath}
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to={eventsPath}
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Events
          </NavLink>
        </li>
        <li>
          <NavLink
            to={profilePath}
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Profile
          </NavLink>
        </li>
      </ul>

      <div className='nav-actions'>
        <Link to={createEventPath} className='create-event-btn'>Create Event</Link>
        {isAuthenticated && (
          <button type='button' className='nav-logout' onClick={handleLogout}>
            Log Out
          </button>
        )}
      </div>

      {/* Hamburger — visible only on mobile */}
      <button
        type='button'
        className='nav-hamburger'
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen((prev) => !prev)}
      >
        {mobileOpen ? '✕' : '☰'}
      </button>

      {mobileOpen && (
        <div className='nav-mobile-menu'>
          <NavLink to={homePath} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} onClick={closeMenu}>Home</NavLink>
          <NavLink to={eventsPath} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} onClick={closeMenu}>Events</NavLink>
          <NavLink to={profilePath} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')} onClick={closeMenu}>Profile</NavLink>
          <Link to={createEventPath} className='create-event-btn' onClick={closeMenu}>Create Event</Link>
          {isAuthenticated && (
            <button type='button' className='nav-logout' onClick={handleLogout}>Log Out</button>
          )}
        </div>
      )}
    </nav>
  )
}
