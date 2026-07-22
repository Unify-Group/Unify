import { Link } from 'react-router-dom'

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
          <Link to='/'>Home</Link>
        </li>
        <li>
          <a href='#featured-events'>Events</a>
        </li>
        <li>
          <a href='#about'>About</a>
        </li>
      </ul>

      <Link to='/signup' className='create-event-btn'>
        + Create Event
      </Link>
    </nav>
  )
}
