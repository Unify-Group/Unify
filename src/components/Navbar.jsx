import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { clearSession, getSavedUser } from '../utils/authClient'

export const Navbar = ({ isAuthenticated }) => {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const navRef = useRef(null)
  const savedUser = getSavedUser()
  const homePath = isAuthenticated ? '/home' : '/'
  const eventsPath = isAuthenticated ? '/events' : '/login'
  const profilePath = isAuthenticated ? '/profile' : '/login'
  const createEventPath = isAuthenticated ? '/events/create' : '/login'
  const avatarUrl = String(savedUser?.profile?.avatar_url || savedUser?.avatar_url || '').trim()
  const avatarInitial = String(savedUser?.first_name || 'U').trim().charAt(0).toUpperCase() || 'U'

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setMobileOpen(false)
        setProfileMenuOpen(false)
      }
    }

    if (mobileOpen || profileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [mobileOpen, profileMenuOpen])

  useEffect(() => {
    if (!profileMenuOpen) {
      return
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setProfileMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [profileMenuOpen])

  const closeMenu = () => {
    setMobileOpen(false)
    setProfileMenuOpen(false)
  }

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
          <div className='nav-profile-menu-wrapper'>
            <button
              type='button'
              className='nav-avatar-button'
              aria-label='Open profile menu'
              aria-haspopup='menu'
              aria-expanded={profileMenuOpen}
              aria-controls='nav-profile-menu'
              onClick={() => setProfileMenuOpen((current) => !current)}
            >
              {avatarUrl ? <img src={avatarUrl} alt='Your profile' /> : <span>{avatarInitial}</span>}
            </button>

            {profileMenuOpen && (
              <div id='nav-profile-menu' className='nav-profile-menu' role='menu' aria-label='Profile menu'>
                <Link to='/profile' className='nav-profile-menu-item' role='menuitem' onClick={closeMenu}>
                  Profile
                </Link>
                <button type='button' className='nav-profile-menu-item is-danger' role='menuitem' onClick={handleLogout}>
                  Log Out
                </button>
              </div>
            )}
          </div>
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
