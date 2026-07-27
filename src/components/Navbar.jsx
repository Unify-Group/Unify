import { Link, NavLink, useNavigate } from 'react-router-dom'
import { clearSession } from '../utils/authClient'

export const Navbar = ({ isAuthenticated }) => {
  const navigate = useNavigate()
  const homePath = isAuthenticated ? '/home' : '/'
  const eventsPath = isAuthenticated ? '/events' : '/login'
  const profilePath = isAuthenticated ? '/profile' : '/login'
  const createEventPath = isAuthenticated ? '/events/create' : '/login'

  const handleLogout = () => {
    clearSession()
    navigate('/login')
  }

  return (
    <nav className='navbar'>
      <Link to={homePath} className='brand'>
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
    </nav>
  )
}
