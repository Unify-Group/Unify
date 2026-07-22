import { useLocation, useRoutes } from 'react-router-dom'
import './App.css'
import { Navbar } from './components/Navbar'
import { CreateEvent } from './pages/CreateEvent'
import { Home } from './pages/Home'

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
      element: (
        <section className='signup-placeholder'>
          <h2>Sign up page coming soon</h2>
          <p>Account creation is not built yet, but this route is now ready.</p>
        </section>
      ),
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
