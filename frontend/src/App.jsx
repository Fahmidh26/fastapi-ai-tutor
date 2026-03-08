import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, Navigate, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8002'
const EXPERTS_API_BASE_URL =
  import.meta.env.VITE_EXPERTS_API_BASE_URL || import.meta.env.VITE_AISITE_OAUTH_BASE_URL || 'http://localhost:8000'
const EXPERTS_API_URL = `${EXPERTS_API_BASE_URL.replace(/\/$/, '')}/api/experts`

const FALLBACK_TUTORS = [
  {
    name: 'Nova',
    subtitle: 'Science Expert',
    level: 'Advanced',
    style: 'Socratic',
    rating: 4.9,
    description:
      'Specializes in quantum physics and calculus. Nova uses investigative questioning to help you grasp complex theories.',
    cover:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAf_xIn22TNfUVt1cfBTeaGU_I59XiTLapdR42rAJfoI6412jY7vouf8TPjtEvVgGhuf8Cf5JNB8ry3eL3iuV4bmHf7isNJYDU2eVuQCXvoZ5TGxAw-KNZdvc7Y8umsa99orrmdiuGQDhk7AvF5e8ZQPh2KggYU6Hqv9Byc68D8xSw2FSHf7lYlwg5N4DVky2AQEJ89QHZ_nNsWiP7KQBeHwnx1AZ1E6cSG3ALCaXqxMtz9L8UWU30OuaxhtBUo4gbuG0DCqWheTx-F',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBJQ4OV9HG-7sYwci7W2vJjx6diB2C078nKAMLdPGCMslErNrZab_XXCSKNY5sSZ7JTMU2loRru4EWNFG1Ok8H88HdnAW6mIRZGsiE1w_ejpuS3nYY-3ndsaIPgGj5pnzsZPj7cqVlWd9jzFeS_MXgV2tW5saD8yzy6AvhgRInBgvKy_xRATEBOV-zVe2_7n4p_Bsrd1kYlCaFyeugwtQSs2jgP28mZpT7pm0N-jhPXE3Sll8zWL9DCJjOOkOPrP00pdEArpNoN7XQp',
  },
  {
    name: 'Codex',
    subtitle: 'Coding Specialist',
    level: 'Beginner',
    style: 'Direct',
    rating: 5.0,
    description:
      'Expert in Python and Web Development. Codex provides efficient code reviews and builds projects alongside you.',
    cover:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA6RJMOIafl8pFaAutdCmjPI0oCnwDybUsIsLxhsu91stZ5DtBlRA54hfubokUql04JJRXOJwAooTz3aNCSRXfrU3PRvCpWnRf01keJBV1KP2qhufIvZlJZD7l2Bql8hwjVXrvDTh5__h2f-kmJcrCPjlLl_1x5cO6KfWEaWIVkr8EXtYCt1YlP6C5aRYGW__1cL-Zxr7l05IK26MOJl6sTmdGzgX-pkXUJPP4nl2WuyfEeuaQk1l19SrQ5a2dD7iBzfiQ3YbfngnsG',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC0T8G83V2wAa1TCXJMlPPo2CO_OlVNcPmxOxsvZIxigppJNPod8ONdav-hE1QVQ9ryetF5i5dp4mxX79UHpJukn4CMLsW1fyDtG6gqwAVJrbhxAyXHlUWC0DyCerp33WNB9b1x9nJjTf1nceZ7vCMBafu_R0xJNvjTmcM02QATMK0NvaIhlgPFlmA77gHYpu2hC1dVD0NejNAN-R_G45tpt_KkSDfS-SwOHCJe3tMeagt2Tk8j0YsjKlMuwrzKyxepr4kPsfinXoLk',
  },
  {
    name: 'Minerva',
    subtitle: 'Humanities Professor',
    level: 'Advanced',
    style: 'Supportive',
    rating: 4.8,
    description:
      'Specializes in classical literature and world history. Minerva offers thoughtful critiques and historical context.',
    cover:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDRJJLpQS6anFwdFBkF9QvLr79eHIauBnxmjgEQ0Uk-8GVVKrQ_8y0KbHtl0jPoxcnWSMWrcY5ed5r5u6VbTKSCO1RdOI5jy_mqa3-qp6JkJzFFDmRubsp_vRP4OJWVOdpn071mxSghQKr7nbOPLxvWxDj6vTRIIfPw4D2nnCx3CxLtEt2Hh3bltxLUi2DJyAaEP0IhgKzgRIv4QrcEOKrib18tyVZN02xCtQUD0xTRxE75jhth3dgD8jR8SXriPvhlybgqB92QRsYk',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCkaQHTwQoHHaCkkWXDXQhM2bsJY6CvTnw6iTdn_YW1eSPstkvzJryk_xB3XC4HPyw4Kg66o4bMg5OaFTlO1LhEFUWLI2p7IeztJk2HzuZ5xpS7FGprmoCWjyQYLMpoSGbugX2p7EpUVj2oniViHVikm6LORifKDTLUpwTwv41_XrWHlAT3pxqazQtD_MAGXkdiJRZCnx1eK68Xv-OzX2byeX5kJaTRtejxkUe7VYF-t0wX7VDdrTA1ZcUDOsTkf3ZY0Cey3bNf1Ugt',
  },
]

const SUBJECTS = ['All Subjects', 'Math', 'Science', 'Humanities', 'Coding']
const PERSONALITIES = ['Socratic', 'Direct', 'Supportive']

function normalizeExperts(payload) {
  const items = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.experts)
      ? payload.experts
      : Array.isArray(payload?.data)
        ? payload.data
        : []

  return items
    .map((expert, index) => {
      const fallback = FALLBACK_TUTORS[index % FALLBACK_TUTORS.length]
      const ratingCandidate = Number(expert?.rating ?? expert?.avg_rating ?? fallback.rating)

      return {
        name: expert?.name || expert?.expert_name || fallback.name,
        subtitle: expert?.subtitle || expert?.specialty || expert?.title || fallback.subtitle,
        level: expert?.level || expert?.difficulty || fallback.level,
        style: expert?.style || expert?.personality || fallback.style,
        rating: Number.isFinite(ratingCandidate) ? ratingCandidate : fallback.rating,
        description: expert?.description || expert?.bio || fallback.description,
        cover: expert?.cover || expert?.cover_image || expert?.image || fallback.cover,
        avatar: expert?.avatar || expert?.avatar_url || expert?.image || fallback.avatar,
      }
    })
    .filter((expert) => Boolean(expert.name))
}

function AppShell() {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)
  const [error, setError] = useState('')
  const location = useLocation()

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
    if (location.pathname === '/auth/callback') {
      window.history.replaceState({}, '', '/')
    }
    loadSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname])

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
    <Routes>
      <Route
        path="/"
        element={
          <DashboardPage
            loading={loading}
            session={session}
            error={error}
            startLogin={startLogin}
            logout={logout}
          />
        }
      />
      <Route
        path="/dashboard-auth"
        element={
          <DashboardPage
            loading={loading}
            session={session}
            error={error}
            startLogin={startLogin}
            logout={logout}
          />
        }
      />
      <Route
        path="/study"
        element={
          <StudyPage
            loading={loading}
            session={session}
            error={error}
            startLogin={startLogin}
            logout={logout}
          />
        }
      />
      <Route path="/auth/callback" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function DashboardPage({ loading, session, error, startLogin, logout }) {
  const navigate = useNavigate()
  const userName = session?.user?.name || session?.user?.email || 'Guest'
  const [tutors, setTutors] = useState(FALLBACK_TUTORS)
  const [tutorsLoading, setTutorsLoading] = useState(true)
  const [tutorsError, setTutorsError] = useState('')

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        setTutorsError('')
        const response = await fetch(EXPERTS_API_URL, {
          headers: {
            Accept: 'application/json',
          },
        })

        if (!response.ok) {
          throw new Error(`Experts request failed (${response.status})`)
        }

        const data = await response.json()
        const normalizedExperts = normalizeExperts(data)
        setTutors(normalizedExperts.length ? normalizedExperts : FALLBACK_TUTORS)
      } catch (err) {
        setTutors(FALLBACK_TUTORS)
        setTutorsError(err instanceof Error ? err.message : 'Could not load experts API')
      } finally {
        setTutorsLoading(false)
      }
    }

    fetchExperts()
  }, [])

  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-logo">AI</span>
          <span>AI Tutor Gallery</span>
        </div>
        <div className="topbar-right">
          <input className="search-input" placeholder="Search for subjects, tutors, or topics..." />
          {session ? (
            <button className="top-action-btn" onClick={logout}>
              Logout
            </button>
          ) : (
            <button className="top-action-btn" onClick={startLogin}>
              Login
            </button>
          )}
        </div>
      </header>

      <div className="dashboard-layout">
        <aside className="sidebar">
          <section>
            <h4>Subject</h4>
            <nav className="menu-list">
              {SUBJECTS.map((subject, index) => (
                <button key={subject} className={`menu-item ${index === 0 ? 'active' : ''}`} type="button">
                  {subject}
                </button>
              ))}
            </nav>
          </section>

          <section>
            <h4>Personality</h4>
            <div className="check-list">
              {PERSONALITIES.map((item, index) => (
                <label key={item} className="check-item">
                  <input type="radio" name="personality" defaultChecked={index === 0} />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </section>

          <section>
            <h4>Level</h4>
            <div className="level-toggle">
              <button type="button">Beginner</button>
              <button type="button" className="active">
                Advanced
              </button>
            </div>
          </section>
        </aside>

        <section className="content-pane">
          <div className="content-head">
            <div>
              <h1>Recommended Tutors</h1>
              <p>Welcome, {userName}. Discover AI companions tailored to your learning style.</p>
            </div>
            <p className="sort-label">Sort by: Most Popular</p>
          </div>

          {loading ? <p>Loading session...</p> : null}
          {error ? <p className="error-text">Error: {error}</p> : null}
          {!loading && !session ? (
            <p className="muted-text">Login to access session-aware study. You can still preview tutors now.</p>
          ) : null}
          {tutorsLoading ? <p className="muted-text">Loading recommended tutors...</p> : null}
          {tutorsError ? <p className="muted-text">Experts API unavailable, showing default tutors.</p> : null}

          <div className="tutor-grid">
            {tutors.map((tutor) => (
              <article key={tutor.name} className="tutor-card">
                <div className="cover" style={{ backgroundImage: `url(${tutor.cover})` }}>
                  <div className="cover-overlay" />
                </div>
                <div className="card-body">
                  <div className="card-top">
                    <img src={tutor.avatar} alt={tutor.name} className="avatar" />
                    <div>
                      <h3>{tutor.name}</h3>
                      <p>{tutor.subtitle}</p>
                    </div>
                  </div>
                  <div className="chips">
                    <span>{tutor.level}</span>
                    <span>{tutor.style}</span>
                  </div>
                  <p className="desc">{tutor.description}</p>
                  <div className="card-bottom">
                    <strong>{tutor.rating.toFixed(1)}</strong>
                    <button onClick={() => navigate(`/study?tutor=${encodeURIComponent(tutor.name)}`)}>Start Learning</button>
                  </div>
                </div>
                </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}

function StudyPage({ loading, session, error, startLogin, logout }) {
  const navigate = useNavigate()
  const location = useLocation()
  const tutorName = useMemo(() => {
    const params = new URLSearchParams(location.search)
    return params.get('tutor') || 'Dr. Quantum'
  }, [location.search])
  const studentName = session?.user?.name || session?.user?.email || 'Student'

  if (!loading && !session) {
    return (
      <main className="study-page center-content">
        <h1>Login Required</h1>
        <p>Please login first, then continue to your study session.</p>
        <div className="inline-actions">
          <button onClick={startLogin}>Login with Main Site</button>
          <button onClick={() => navigate('/')}>Back to Dashboard</button>
        </div>
      </main>
    )
  }

  return (
    <main className="study-shell">
      <aside className="study-left">
        <div className="study-left-head">
          <div className="study-icon">S</div>
          <div>
            <h3>Study Session</h3>
            <p>AI Tutor Pro</p>
          </div>
        </div>

        <button className="new-chat-btn" type="button">
          + New Chat
        </button>

        <div className="study-menu-block">
          <p className="menu-title">Current Session</p>
          <button className="study-menu active" type="button">
            Active Chat
          </button>
          <button className="study-menu" type="button">
            Session Notes
          </button>
          <button className="study-menu" type="button">
            Flashcards
          </button>
        </div>

        <div className="study-menu-block">
          <p className="menu-title">History</p>
          <button className="study-menu" type="button">
            Linear Algebra
          </button>
          <button className="study-menu" type="button">
            Python Basics
          </button>
          <button className="study-menu" type="button">
            History of Art
          </button>
        </div>

        <div className="study-user-row">
          <div>
            <strong>{studentName}</strong>
            <p>Free Tier</p>
          </div>
          <button type="button" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      <section className="study-main">
        <header className="study-main-head">
          <div className="study-tutor-head">
            <button className="back-btn" type="button" onClick={() => navigate('/')}>
              Back
            </button>
            <div>
              <h2>{tutorName}</h2>
              <p>Mathematics & CS Expert - Active</p>
            </div>
          </div>
          <button className="profile-btn" type="button">
            View Profile
          </button>
        </header>

        <section className="chat-panel">
          {loading ? <p>Loading session...</p> : null}
          {error ? <p className="error-text">Error: {error}</p> : null}

          <article className="chat-row">
            <div className="msg tutor">
              <p>
                Hello {studentName}! Let us continue with {tutorName}. We will connect intuition, equations, and code so the
                concept is clear and practical.
              </p>
              <pre className="code-block">{`def trapezoidal_rule(f, a, b, n):
    h = (b - a) / n
    s = (f(a) + f(b)) / 2.0
    for i in range(1, n):
        s += f(a + i * h)
    return s * h`}</pre>
            </div>
          </article>

          <article className="chat-row user-row">
            <div className="msg user">
              <p>
                This makes sense now. Could you explain how the error term scales as we increase <strong>n</strong>?
              </p>
            </div>
          </article>

          <article className="chat-row">
            <div className="typing">...</div>
          </article>
        </section>

        <footer className="composer">
          <textarea placeholder="Ask about formulas, code, or upload a problem image..." rows={1} />
          <button type="button">Send</button>
        </footer>
      </section>

      <aside className="study-right">
        <button type="button">💡</button>
        <button type="button">📝</button>
        <button type="button">❓</button>
        <button type="button">🧾</button>
      </aside>
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}
