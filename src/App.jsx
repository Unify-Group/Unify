import { useEffect, useState } from 'react'
import { Navigate, useLocation, useRoutes } from 'react-router-dom'
import './App.css'
import { Navbar } from './components/Navbar'
import { BrowseEvents } from './pages/BrowseEvents'
import { EventDetails } from './pages/EventDetails'
import { EventAttendees } from './pages/EventAttendees'
import { CreateEvent } from './pages/CreateEvent'
import { EditEvent } from './pages/EditEvent'
import { Home } from './pages/Home'
import { HomeDashboard } from './pages/HomeDashboard'
import { Profile } from './pages/Profile'
import { PublicProfile } from './pages/PublicProfile'
import { SignIn } from './pages/SignIn'
import { SignUp } from './pages/SignUp'
import { clearSession, getSavedToken, refreshCurrentUser } from './utils/authClient'

function App() {
  const location = useLocation()
  const [isAuthReady, setIsAuthReady] = useState(false)
  const isAuthenticated = Boolean(getSavedToken())
  const hideHeader = location.pathname === '/login' || location.pathname === '/signup'

  useEffect(() => {
    const bootstrapSession = async () => {
      try {
        await refreshCurrentUser()
      } catch {
        clearSession()
      } finally {
        setIsAuthReady(true)
      }
    }

    bootstrapSession()
  }, [])

  const routes = useRoutes([
    {
      path: '/',
      element: <Home isAuthenticated={isAuthenticated} />,
    },
    {
      path: '/home',
      element: isAuthenticated ? <HomeDashboard /> : <Navigate to='/login' replace />,
    },
    {
      path: '/events/create',
      element: isAuthenticated ? <CreateEvent /> : <Navigate to='/login' replace />,
    },
    {
      path: '/events/:id/edit',
      element: isAuthenticated ? <EditEvent /> : <Navigate to='/login' replace />,
    },
    {
      path: '/events',
      element: isAuthenticated ? <BrowseEvents /> : <Navigate to='/login' replace />,
    },
    {
      path: '/events/:id',
      element: isAuthenticated ? <EventDetails /> : <Navigate to='/login' replace />,
    },
    {
      path: '/events/:id/attendees',
      element: isAuthenticated ? <EventAttendees /> : <Navigate to='/login' replace />,
    },
    {
      path: '/profile',
      element: isAuthenticated ? <Profile /> : <Navigate to='/login' replace />,
    },
    {
      path: '/users/:id',
      element: isAuthenticated ? <PublicProfile /> : <Navigate to='/login' replace />,
    },
    {
      path: '/signup',
      element: isAuthenticated ? <Navigate to='/home' replace /> : <SignUp />,
    },
    {
      path: '/login',
      element: isAuthenticated ? <Navigate to='/home' replace /> : <SignIn />,
    },
    {
      path: '*',
      element: <Navigate to={isAuthenticated ? '/home' : '/'} replace />,
    },
  ])

  return (
    <div className='app'>
      <a href='#main-content' className='skip-link'>Skip to main content</a>
      {!isAuthReady && <div className='auth-bootstrap' aria-live='polite' aria-busy='true'>Loading session...</div>}
      {isAuthReady && !hideHeader && (
        <header className='site-header'>
          <Navbar isAuthenticated={isAuthenticated} />
        </header>
      )}
      {isAuthReady && <main id='main-content' className='site-main'>{routes}</main>}
    </div>
  )
}

export default App
