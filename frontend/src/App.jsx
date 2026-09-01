import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Schedule from './pages/Schedule'
import Contact from './pages/Contact'
import Events from './pages/Events'
import EventDetails from './pages/EventDetails'
import Payment from './pages/Payment'

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

  return (
    <div className="event-app">
      <EventDetails eventId={eventId} onBack={() => navigate('/events')} />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
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
  )
}