import { useEffect, useState } from 'react'
import { useLocation, useRoutes } from 'react-router-dom'
import './App.css'
import { Navbar } from './components/Navbar'
import { BrowseEvents } from './pages/BrowseEvents'
import { CreateEvent } from './pages/CreateEvent'
import { Home } from './pages/Home'
import { Profile } from './pages/Profile'
import { SignIn } from './pages/SignIn'
import { SignUp } from './pages/SignUp'
import { clearSession, refreshCurrentUser } from './utils/authClient'

function App() {
  const location = useLocation()
  const [isAuthReady, setIsAuthReady] = useState(false)
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
      element: <Home />,
    },
    {
      path: '/events/create',
      element: <CreateEvent />,
    },
    {
      path: '/events',
      element: <BrowseEvents />,
    },
    {
      path: '/profile',
      element: <Profile />,
    },
    {
      path: '/signup',
      element: <SignUp />,
    },
    {
      path: '/login',
      element: <SignIn />,
    },
  ])

  return (
    <div className='app'>
      {!isAuthReady && <div className='auth-bootstrap'>Loading session...</div>}
      {!hideHeader && (
        <header className='site-header'>
          <Navbar />
        </header>
      )}
      <main className='site-main'>{routes}</main>
    </div>
  )
}

export default App
