import { useState } from 'react'
import './App.css'
import { Navbar } from './components/Navbar'

function App() {
  return (
    <div className='app container'>
      <header>
        <Navbar />
      </header>
    </div>
  )
}

export default App
