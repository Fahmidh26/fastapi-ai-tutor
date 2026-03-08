import { useEffect, useState } from 'react'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8002'

function App() {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)
  const [error, setError] = useState('')

  const loadSession = async () => {
    try {
      setError('')
      const response = await fetch(`${API_BASE_URL}/api/me`, {
        credentials: 'include',
      })

      if (response.status === 401) {
        setSession(null)
        return
      }

      if (!response.ok) {
        throw new Error(`Request failed (${response.status})`)
      }

      const data = await response.json()
      setSession(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unexpected error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (window.location.pathname === '/auth/callback') {
      window.history.replaceState({}, '', '/')
    }
    loadSession()
  }, [])

  const startLogin = () => {
    window.location.href = `${API_BASE_URL}/oauth/login`
  }

  const logout = async () => {
    await fetch(`${API_BASE_URL}/api/logout`, {
      method: 'POST',
      credentials: 'include',
    })
    setSession(null)
  }

  return (
    <main className="container">
      <h1>FastAPI + React OAuth Client</h1>
      <p className="subtitle">Frontend in React, auth/session in FastAPI backend.</p>

      {loading ? <p>Loading session...</p> : null}

      {!loading && !session ? (
        <div className="card">
          <p>You are not authenticated.</p>
          <button onClick={startLogin}>Login with Main Site</button>
        </div>
      ) : null}

      {!loading && session ? (
        <div className="card">
          <p>
            Signed in as <strong>{session.user?.name || session.user?.email || 'User'}</strong>
          </p>
          <button onClick={logout}>Logout</button>
          <h2>User payload</h2>
          <pre>{JSON.stringify(session.user, null, 2)}</pre>
        </div>
      ) : null}

      {error ? (
        <div className="error">
          <p>Error: {error}</p>
          <button onClick={loadSession}>Retry</button>
        </div>
      ) : null}

      <div className="hint">
        <p>
          API Base URL: <code>{API_BASE_URL}</code>
        </p>
      </div>
    </main>
  )
}

export default App
