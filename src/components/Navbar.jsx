import { Link, NavLink } from 'react-router-dom'

export const Navbar = () => {
  return (
    <nav className='navbar'>
      <Link to='/' className='brand'>
        <span className='brand-mark' aria-hidden='true'>
          <span className='dot dot-left'></span>
          <span className='dot dot-right'></span>
        </span>
        <span className='brand-text'>Unify</span>
      </Link>

      <ul className='nav-links'>
        <li>
          <NavLink to='/' className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink
            to='/events'
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Events
          </NavLink>
        </li>
        <li>
          <NavLink
            to='/profile'
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
          >
            Profile
          </NavLink>
        </li>
      </ul>

      <Link to='/signup' className='create-event-btn'>
        + Create Event
      </Link>
    </nav>
  )
}
