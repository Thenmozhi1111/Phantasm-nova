import { lazy, Suspense, useEffect, useRef } from 'react'
import { Routes, Route, Navigate, useNavigate, useParams, useLocation, useNavigationType } from 'react-router-dom'
import Home from './pages/Home'
import Schedule from './pages/Schedule'
import Contact from './pages/Contact'
import Events from './pages/Events'
import EventDetails from './pages/EventDetails'
import Payment from './pages/Payment'
import ErrorBoundary from './components/ErrorBoundary'

const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'))

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      Loading...
    </div>
  )
}

// Remembers each route's scroll position across SPA navigations, keyed
// by pathname. Used so that going BACK from an event's details page
// returns you to exactly where you were in the journey (near the gate
// you clicked) instead of resetting to the very start — see ScrollToTop.
const scrollMemory = new Map()

function ScrollToTop() {
  const { pathname, hash } = useLocation()
  const navigationType = useNavigationType() // 'PUSH' | 'POP' | 'REPLACE'
  const prevPathname = useRef(pathname)

  useEffect(() => {
    // Save the position we're leaving BEFORE acting on the new location,
    // so "back" from event details has somewhere to restore to.
    return () => {
      scrollMemory.set(prevPathname.current, window.scrollY)
    }
  }, [pathname])

  useEffect(() => {
    prevPathname.current = pathname

    // Hash-targeted scrolling is handled separately by ScrollToHash —
    // don't fight it by also forcing the top here.
    if (hash) return

    if (navigationType === 'POP' && scrollMemory.has(pathname)) {
      // Browser/app "back" (or forward) — restore exactly where the user
      // was on this page before they navigated away from it, rather than
      // jumping back to the very top of a long page like the journey.
      window.scrollTo(0, scrollMemory.get(pathname))
    } else {
      // A genuinely new page (clicked a link, opened an event, etc.)
      // should always start at the top.
      window.scrollTo(0, 0)
    }
  }, [pathname, hash, navigationType])

  return null
}

function ScrollToHash() {
  const { pathname, hash } = useLocation()

  useEffect(() => {
    if (!hash) return

    const id = hash.replace('#', '')
    const target = document.getElementById(id)

    if (target) {
      requestAnimationFrame(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }, [pathname, hash])

  return null
}

function EventsPage() {
  const navigate = useNavigate()

  return (
    <div className="event-app">
      <Events onSelectEvent={(id) => navigate(`/events/${id}`)} />
    </div>
  )
}

function EventDetailsPage() {
  const navigate = useNavigate()
  const { eventId } = useParams()

  function handleBack() {
    // Prefer real browser "back" (history POP) so ScrollToTop's saved
    // position for /events is used and the browser's own back button
    // stays in sync with this one. Falls back to a plain navigate when
    // there's nothing to go back to (e.g. the details page was opened
    // directly from a shared link / page refresh, so there's no prior
    // /events entry in this tab's history).
    const canGoBack = window.history.state && window.history.state.idx > 0
    if (canGoBack) {
      navigate(-1)
    } else {
      navigate('/events')
    }
  }

  return (
    <div className="event-app">
      <EventDetails eventId={eventId} onBack={handleBack} />
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <ScrollToTop />
        <ScrollToHash />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:eventId" element={<EventDetailsPage />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/payment" element={<Payment />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}