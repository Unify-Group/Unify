import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
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
  // Prevent React StrictMode double-invocation from exchanging the code twice
  const oauthProcessedRef = useRef(false)

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

      if (oauthProcessedRef.current) return
      oauthProcessedRef.current = true

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

        <button className='oauth-btn' type='button' onClick={onGoogleClick} disabled={googleLoading} aria-busy={googleLoading}>
          <svg className='oauth-icon' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48' aria-hidden='true'>
            <path fill='#4285F4' d='M47.52 24.56c0-1.56-.14-3.06-.4-4.5H24v8.52h13.2c-.57 3.04-2.3 5.61-4.9 7.34v6.1h7.93c4.64-4.28 7.3-10.58 7.3-17.46z'/>
            <path fill='#34A853' d='M24 48c6.48 0 11.92-2.15 15.9-5.82l-7.93-6.1c-2.15 1.44-4.9 2.29-7.97 2.29-6.13 0-11.33-4.14-13.18-9.7H2.58v6.28C6.54 42.65 14.73 48 24 48z'/>
            <path fill='#FBBC05' d='M10.82 28.67A14.48 14.48 0 0 1 9.9 24c0-1.62.28-3.19.92-4.67V13.05H2.58A23.96 23.96 0 0 0 0 24c0 3.86.92 7.51 2.58 10.95l8.24-6.28z'/>
            <path fill='#EA4335' d='M24 9.55c3.45 0 6.55 1.18 8.99 3.51l6.74-6.74C35.9 2.38 30.47 0 24 0 14.73 0 6.54 5.35 2.58 13.05l8.24 6.28C12.67 13.69 17.87 9.55 24 9.55z'/>
          </svg>
          {googleLoading ? 'Connecting...' : 'Continue with Google'}
        </button>

        <button className='oauth-btn' type='button' onClick={onGitHubClick} disabled={githubLoading} aria-busy={githubLoading}>
          <svg className='oauth-icon' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' aria-hidden='true'>
            <path fill='currentColor' d='M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23a11.52 11.52 0 0 1 3-.405 11.52 11.52 0 0 1 3 .405c2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12'/>
          </svg>
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

          {error && <p className='auth-error' role='alert' aria-live='assertive'>{error}</p>}

          <button className='auth-submit' type='submit' disabled={loading} aria-busy={loading}>
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
