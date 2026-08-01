import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { login, saveSession, getGitHubAuthUrl, exchangeGitHubCode, getGoogleAuthUrl, exchangeGoogleCode } from '../utils/authClient'

export const SignIn = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [githubLoading, setGithubLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      const oauthError = searchParams.get('error')

      if (oauthError) {
        setError(`Authentication failed: ${oauthError}`)
        return
      }

      if (!code || !state) {
        return
      }

      try {
        const decodedState = JSON.parse(atob(state))
        const provider = decodedState.provider

        if (provider === 'github') {
          setGithubLoading(true)
          const payload = await exchangeGitHubCode(code)
          saveSession(payload)
          // Clear URL parameters before navigating
          window.history.replaceState({}, document.title, '/login')
          navigate('/home')
        } else if (provider === 'google') {
          setGoogleLoading(true)
          const payload = await exchangeGoogleCode(code)
          saveSession(payload)
          // Clear URL parameters before navigating
          window.history.replaceState({}, document.title, '/login')
          navigate('/home')
        }
      } catch (err) {
        console.error('OAuth callback error:', err)
        setError(err.message || 'Authentication failed')
        // Clear URL parameters even on error
        window.history.replaceState({}, document.title, '/login')
      } finally {
        setGithubLoading(false)
        setGoogleLoading(false)
      }
    }

    handleOAuthCallback()
  }, [searchParams, navigate])

  const onChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const onGitHubClick = async () => {
    setGithubLoading(true)
    setError('')

    try {
      const { url } = await getGitHubAuthUrl()
      window.location.href = url
    } catch (err) {
      setError(err.message)
      setGithubLoading(false)
    }
  }

  const onGoogleClick = async () => {
    setGoogleLoading(true)
    setError('')

    try {
      const { url } = await getGoogleAuthUrl()
      window.location.href = url
    } catch (err) {
      setError(err.message)
      setGoogleLoading(false)
    }
  }

  const onSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const payload = await login({ email: form.email, password: form.password })
      saveSession(payload)
      navigate('/home')
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

        <button className='oauth-btn' type='button' onClick={onGoogleClick} disabled={googleLoading}>
          <span className='oauth-dot google'></span>
          {googleLoading ? 'Connecting...' : 'Continue with Google'}
        </button>

        <button className='oauth-btn' type='button' onClick={onGitHubClick} disabled={githubLoading}>
          <span className='oauth-dot github'></span>
          {githubLoading ? 'Connecting...' : 'Continue with GitHub'}
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
          <div className='password-field'>
            <input
              id='password'
              name='password'
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={onChange}
              placeholder='Enter your password'
              required
            />
            <button
              type='button'
              className='password-toggle'
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

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
