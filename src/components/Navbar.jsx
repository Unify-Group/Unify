import { Link } from 'react-router-dom'

export const Navbar = () => {
  return (
    <nav>
      <ul>
        <li>
          <Link to='/'>
            <h1>Unify</h1>
          </Link>
        </li>
        <li>
          <Link to='#'>View Events</Link>
        </li>
        <li>
          <Link to='/events/new'>Create Event</Link>
        </li>
      </ul>

      <ul>
        <li>
          <Link to='#'>Log in</Link>
        </li>
        <li>
          <Link to='#' role='button'>
            Sign up
          </Link>
        </li>
      </ul>
    </nav>
  )
}
