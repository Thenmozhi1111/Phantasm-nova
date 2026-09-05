<<<<<<< HEAD
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import AuthLayout from '../components/AuthLayout'
import Field from '../components/Field'
import { loginUser } from '../lib/api'

export default function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const button = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.form-item', { x: -12, opacity: 0 }, { x: 0, opacity: 1, duration: .5, stagger: .07, delay: .5, ease: 'power2.out' })
    })
    return () => ctx.revert()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    const data = Object.fromEntries(new FormData(e.currentTarget).entries())

    try {
      setLoading(true)
      const res = await loginUser({ email: data.email, password: data.password })
      if (res?.token) localStorage.setItem('authToken', res.token)
      if (res?.user) localStorage.setItem('authUser', JSON.stringify(res.user))
      navigate('/payment', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const google = () => alert('Google sign-in can be connected here.')

  return (
    <AuthLayout  title="Welcome Back!" subtitle="Login to continue">
      <div className="auth-card glass-card relative w-full rounded-3xl p-6 sm:p-8">
        <div className="absolute -top-7 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full border border-sky-400/80 bg-[#03101e] text-2xl shadow-[0_0_25px_rgba(0,136,255,.35)]">◉</div>
        <h2 className="auth-card-title mb-7 mt-1 text-center text-xl font-semibold text-slate-100">Login to your account</h2>

        <form onSubmit={submit} className="space-y-5">
          <div className="form-item"><Field name="email" label="Email Address" type="email" autoComplete="email" placeholder="Enter your email address" icon="@" required /></div>

          <div className="form-item">
            <span className="field-label mb-2 block text-xs font-medium text-slate-300">Password</span>
            <div className="field flex h-12 items-center rounded-xl border border-slate-700/80 bg-[#061524]/80 px-3 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.04)]">
              <span className="mr-3 flex h-6 w-6 items-center justify-center rounded-md border border-sky-400/20 bg-sky-500/5 text-sm text-sky-200">◆</span>
              <input name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" className="field-input w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" required />
              <button type="button" onClick={() => setShowPassword(v => !v)} className="ml-2 rounded-md px-2 py-1 text-xs text-slate-500 hover:text-sky-300" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'HIDE' : 'SHOW'}</button>
            </div>
          </div>

          <div className="form-item flex items-center justify-between gap-3 text-xs">
            
            <Link to="/forgot-password" className="link-glow text-sm font-medium text-blue-400">Forgot Password?</Link>          
          </div>

          {error && <p className="form-item text-center text-xs font-medium text-red-400">{error}</p>}

          <button ref={button} type="submit" disabled={loading} className="primary-glow form-item w-full rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 py-3.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(0,111,255,.25)] disabled:opacity-60">{loading ? 'Logging in…' : 'Login'}</button>
        </form>

        {/* <div className="my-6 flex items-center gap-4 text-xs text-slate-500"><span className="h-px flex-1 bg-slate-700/70" /><span>OR</span><span className="h-px flex-1 bg-slate-700/70" /></div>

        <button onClick={google} className="form-item flex w-full items-center justify-center gap-3 rounded-xl border border-slate-700/80 bg-[#061524]/70 py-3 text-sm text-slate-200 transition hover:border-sky-500/40 hover:bg-[#0a1d31]">
          <span className="font-bold text-sky-400">G</span> Continue with Google
        </button> */}

        <p className="mt-6 text-center text-xs text-slate-500">Don't have an account? <Link className="link-glow font-medium text-sky-400" to="/register">Register →</Link></p>
      </div>
    </AuthLayout>
  )
}
=======
import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import AuthLayout from '../components/AuthLayout'
import Field from '../components/Field'
import { loginUser } from '../lib/api'

export default function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const button = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.form-item', { x: -12, opacity: 0 }, { x: 0, opacity: 1, duration: .5, stagger: .07, delay: .5, ease: 'power2.out' })
    })
    return () => ctx.revert()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    const data = Object.fromEntries(new FormData(e.currentTarget).entries())

    try {
      setLoading(true)
      const res = await loginUser({ email: data.email, password: data.password })
      if (res?.token) localStorage.setItem('authToken', res.token)
      if (res?.user) localStorage.setItem('authUser', JSON.stringify(res.user))
      navigate('/payment', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const google = () => alert('Google sign-in can be connected here.')

  return (
    <AuthLayout  title="Welcome Back!" subtitle="Login to continue">
      <div className="auth-card glass-card relative w-full rounded-3xl p-6 sm:p-8">
        <div className="absolute -top-7 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full border border-sky-400/80 bg-[#03101e] text-2xl text-white shadow-[0_0_25px_rgba(0,136,255,.35)]">◉</div>
        <h2 className="auth-card-title mb-7 mt-1 text-center text-xl font-semibold text-slate-100">Login to your account</h2>

        <form onSubmit={submit} className="space-y-5">
          <div className="form-item"><Field name="email" label="Email Address" type="email" autoComplete="email" placeholder="Enter your email address" icon="@" required /></div>

          <div className="form-item">
            <span className="field-label mb-2 block text-xs font-medium text-slate-300">Password</span>
            <div className="field flex h-12 items-center rounded-xl border border-slate-700/80 bg-[#061524]/80 px-3 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.04)]">
              <span className="mr-3 flex h-6 w-6 items-center justify-center rounded-md border border-sky-400/20 bg-sky-500/5 text-sm text-sky-200">◆</span>
              <input name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" placeholder="Enter your password" className="field-input w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" required />
              <button type="button" onClick={() => setShowPassword(v => !v)} className="ml-2 rounded-md px-2 py-1 text-xs text-slate-500 hover:text-sky-300" aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? 'HIDE' : 'SHOW'}</button>
            </div>
          </div>

          <div className="form-item flex items-center justify-between gap-3 text-xs">
            
            <Link to="/forgot-password" className="link-glow text-sm font-medium text-blue-400">Forgot Password?</Link>          
          </div>

          {error && <p className="form-item text-center text-xs font-medium text-red-400">{error}</p>}

          <button ref={button} type="submit" disabled={loading} className="primary-glow form-item w-full rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 py-3.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(0,111,255,.25)] disabled:opacity-60">{loading ? 'Logging in…' : 'Login'}</button>
        </form>

        {/* <div className="my-6 flex items-center gap-4 text-xs text-slate-500"><span className="h-px flex-1 bg-slate-700/70" /><span>OR</span><span className="h-px flex-1 bg-slate-700/70" /></div>

        <button onClick={google} className="form-item flex w-full items-center justify-center gap-3 rounded-xl border border-slate-700/80 bg-[#061524]/70 py-3 text-sm text-slate-200 transition hover:border-sky-500/40 hover:bg-[#0a1d31]">
          <span className="font-bold text-sky-400">G</span> Continue with Google
        </button> */}

        <p className="mt-6 text-center text-xs text-slate-500">Don't have an account? <Link className="link-glow font-medium text-sky-400" to="/register">Register →</Link></p>
      </div>
    </AuthLayout>
  )
}
>>>>>>> 16840363 (Payment Updated)
