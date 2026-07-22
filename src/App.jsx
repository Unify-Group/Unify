import { useLocation, useRoutes } from 'react-router-dom'
import './App.css'
import { Navbar } from './components/Navbar'
import { CreateEvent } from './pages/CreateEvent'
import { Home } from './pages/Home'
import { SignIn } from './pages/SignIn'
import { SignUp } from './pages/SignUp'

function App() {
  const location = useLocation()

  const routes = useRoutes([
    {
      path: '/',
      element: <Home />,
    },
    {
      path: '/events/new',
      element: <CreateEvent />,
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
      {location.pathname === '/' && (
        <header className='site-header'>
          <Navbar />
        </header>
      )}
      <main className='site-main'>{routes}</main>
    </div>
  )
}

export default App
