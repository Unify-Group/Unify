import { useState } from 'react'
import { useRoutes } from 'react-router-dom'
import './App.css'
import { Navbar } from './components/Navbar'
import { CreateEvent } from './pages/CreateEvent'

function App() {
  const routes = useRoutes([
    {
      path: '/events/new',
      element: <CreateEvent />,
    },
  ])

  return (
    <div className='app container'>
      <header>
        <Navbar />
      </header>
      <main>{routes}</main>
    </div>
  )
}

export default App
