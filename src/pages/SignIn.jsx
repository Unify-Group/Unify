import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { login, saveSession } from '../utils/authClient'

export const SignIn = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload = await login({ email: form.email, password: form.password })
      saveSession(payload)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className='auth-layout'>
      <header className='auth-topbar'>
        <Link to='/' className='brand'>
          <span className='brand-mark' aria-hidden='true'>
            <span className='dot dot-left'></span>
            <span className='dot dot-right'></span>
          </span>
          <span className='brand-text'>Unify</span>
        </Link>
      </header>

      <div className='auth-card'>
        <div className='auth-card-head'>
          <span className='brand-mark' aria-hidden='true'>
            <span className='dot dot-left'></span>
            <span className='dot dot-right'></span>
          </span>
          <h1>Sign in to Unify</h1>
          <p>Welcome back. Let&apos;s find your next event.</p>
        </div>

        <button className='oauth-btn' type='button' disabled>
          <span className='oauth-dot google'></span>
          Continue with Google
        </button>

        <button className='oauth-btn' type='button' disabled>
          <span className='oauth-dot github'></span>
          Continue with GitHub
        </button>

        <div className='auth-divider'>
          <span>OR</span>
        </div>

        <form className='auth-form' onSubmit={onSubmit}>
          <label htmlFor='email'>Email</label>
          <input
            id='email'
            name='email'
            type='email'
            value={form.email}
            onChange={onChange}
            placeholder='you@example.com'
            required
          />

          <label htmlFor='password'>Password</label>
          <input
            id='password'
            name='password'
            type='password'
            value={form.password}
            onChange={onChange}
            placeholder='Enter your password'
            required
          />

          {error && <p className='auth-error'>{error}</p>}

          <button className='auth-submit' type='submit' disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className='auth-switch'>
          Don&apos;t have an account? <Link to='/signup'>Sign Up</Link>
        </p>
      </div>
    </section>
  )
}
