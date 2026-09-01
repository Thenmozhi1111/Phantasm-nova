import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { gsap } from 'gsap'
import AuthLayout from '../components/AuthLayout'
import Field from '../components/Field'
import { registerUser } from '../lib/api'


export default function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.register-item', { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: .45, stagger: .055, delay: .45, ease: 'power2.out' })
    })
    return () => ctx.revert()
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    const data = Object.fromEntries(new FormData(e.currentTarget).entries())

    if (data.password.length < 6) return setError('Password must contain at least 6 characters.')
    if (!/^\d{10}$/.test(data.mobile)) return setError('Please enter a valid 10-digit mobile number.')

    try {
      setLoading(true)
      const res = await registerUser({
        name: data.name,
        email: data.email,
        mobile: data.mobile,
        password: data.password,
      })
      if (res?.token) localStorage.setItem('authToken', res.token)
      if (res?.user) localStorage.setItem('authUser', JSON.stringify(res.user))
      navigate('/login', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout  title="Create Your Account" subtitle="Fill in the details below to get started">
      <div className="auth-card glass-card relative w-full rounded-3xl p-6 pt-9 sm:p-8 sm:pt-10">
        <div className="absolute -top-7 left-1/2 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full border border-sky-400/80 bg-[#03101e] text-2xl text-sky-300 shadow-[0_0_25px_rgba(0,136,255,.35)]">+</div>
        <form onSubmit={submit} className="space-y-4">
          <div className="register-item"><Field name="email" label="Email Address" type="email" autoComplete="email" placeholder="Enter your email address" icon="@" required /></div>
          <div className="register-item">
            <span className="field-label mb-2 block text-xs font-medium text-slate-300">Password</span>
            <div className="field flex h-12 items-center rounded-xl border border-slate-700/80 bg-[#061524]/80 px-3 shadow-[inset_0_0_0_1px_rgba(59,130,246,0.04)]">
              <span className="mr-3 flex h-6 w-6 items-center justify-center rounded-md border border-sky-400/20 bg-sky-500/5 text-sm text-sky-200">◆</span>
              <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Create a password" className="field-input w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600" required />
              <button type="button" onClick={() => setShowPassword(v => !v)} className="ml-2 rounded-md px-2 py-1 text-xs text-slate-500 hover:text-sky-300">{showPassword ? 'HIDE' : 'SHOW'}</button>
            </div>
          </div>
          <div className="register-item"><Field name="name" label="Full Name" type="text" autoComplete="name" placeholder="Enter your full name" icon="◇" required /></div>
          {/* <div className="register-item"><Field name="registerNumber" label="Register Number" type="text" placeholder="Enter your register number" icon="#" required /></div> */}
          {/* <div className="register-item"><Field name="college" label="College Name" type="text" placeholder="Enter your college name" icon="⌂" required /></div> */}
          <div className="register-item"><Field name="mobile" label="Mobile Number" type="tel" inputMode="numeric" placeholder="Enter your mobile number" icon="+" required /></div>
          {error && <p className="register-item text-center text-xs font-medium text-red-400">{error}</p>}

          <button disabled={loading} className="primary-glow register-item w-full rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 py-3.5 text-sm font-semibold text-white shadow-[0_0_24px_rgba(0,111,255,.25)] disabled:opacity-60" type="submit">{loading ? 'Creating account…' : 'Create Account'}</button>
        </form>
        <p className="mt-6 text-center text-xs text-slate-500">Already have an account? <Link className="link-glow font-medium text-sky-400" to="/login">Login →</Link></p>
      </div>
    </AuthLayout>
  )
}
