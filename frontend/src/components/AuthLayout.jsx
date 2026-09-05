<<<<<<< HEAD
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import Navbar from './Navbar'
// import Scene from './Scene'

export default function AuthLayout({ children, eyebrow, title, subtitle }) {
  const root = useRef(null)
  const cardArea = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.auth-logo', { y: -18, opacity: 0 }, { y: 0, opacity: 1, duration: .8, ease: 'power3.out' })
      gsap.fromTo('.auth-heading', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .75, delay: .12, ease: 'power3.out' })
      gsap.fromTo('.auth-card', { y: 34, opacity: 0, rotateX: 5, scale: .975 }, { y: 0, opacity: 1, rotateX: 0, scale: 1, duration: 1, delay: .2, ease: 'power3.out' })
      gsap.to('.scanline', { yPercent: 10000, duration: 11, ease: 'none', repeat: -1 })
      gsap.to('.ambient-orb', { y: -20, x: 12, duration: 4.5, repeat: -1, yoyo: true, ease: 'sine.inOut', stagger: .7 })
    }, root)

    const area = cardArea.current
    const card = area?.querySelector('.auth-card')
    const onMove = (event) => {
      if (!area || !card || window.innerWidth < 768) return
      const rect = area.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width - 0.5
      const y = (event.clientY - rect.top) / rect.height - 0.5
      gsap.to(card, { rotateY: x * 5, rotateX: -y * 4, transformPerspective: 1000, duration: .55, ease: 'power2.out' })
    }
    const reset = () => gsap.to(card, { rotateY: 0, rotateX: 0, duration: .7, ease: 'power3.out' })
    area?.addEventListener('pointermove', onMove)
    area?.addEventListener('pointerleave', reset)

    return () => {
      area?.removeEventListener('pointermove', onMove)
      area?.removeEventListener('pointerleave', reset)
      ctx.revert()
    }
  }, [])

  return (
    <>
      <Navbar />
      <main ref={root} className="auth-shell flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid-overlay" />
        <div className="circuit-overlay" />
        <div className="scanline" />
        {/* <Scene /> */}
        <div className="ambient-orb pointer-events-none absolute -left-32 top-1/3 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="ambient-orb pointer-events-none absolute -right-32 top-1/4 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="ambient-orb pointer-events-none absolute bottom-[-12rem] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-indigo-600/10 blur-3xl" />

        <section className="relative z-10 flex w-full max-w-[470px] flex-col items-center pt-20">
          <div className="auth-logo mb-4 text-center">
            <div className="auth-eyebrow mb-2 flex items-center justify-center gap-2 text-[9px] font-semibold uppercase tracking-[0.38em] text-sky-300/90 sm:text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_10px_#38bdf8]" />
              {eyebrow}
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_10px_#38bdf8]" />
            </div>
            <div className="auth-divider mx-auto flex w-32 items-center justify-center gap-2">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-sky-400/60" />
              <span className="h-1.5 w-1.5 rotate-45 border border-sky-300/70" />
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-sky-400/60" />
            </div>
          </div>

          <div className="auth-heading mb-7 text-center">
            <h1 className="auth-title text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_18px_rgba(62,173,255,.12)] sm:text-[36px]">{title}</h1>
            <p className="auth-subtitle mt-2 text-sm text-slate-400">{subtitle}</p>
          </div>

          <div ref={cardArea} className="card-stage w-full [perspective:1000px]">
            {children}
          </div>

          {/* <p className="mt-5 text-center text-[9px] uppercase tracking-[0.28em] text-slate-600">Phantasm • CSE Symposium • 2026</p> */}

          <footer className="mt-5 text-center text-[9px] uppercase tracking-[0.28em] text-slate-600">Phantasm • CSE Symposium • 2026</footer>
        </section>
      </main>
    </>
  )
}
=======
import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
// import Scene from './Scene'

export default function AuthLayout({ children, eyebrow, title, subtitle }) {
  const root = useRef(null)
  const cardArea = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.auth-logo', { y: -18, opacity: 0 }, { y: 0, opacity: 1, duration: .8, ease: 'power3.out' })
      gsap.fromTo('.auth-heading', { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: .75, delay: .12, ease: 'power3.out' })
      gsap.fromTo('.auth-card', { y: 34, opacity: 0, rotateX: 5, scale: .975 }, { y: 0, opacity: 1, rotateX: 0, scale: 1, duration: 1, delay: .2, ease: 'power3.out' })
      gsap.to('.scanline', { yPercent: 10000, duration: 11, ease: 'none', repeat: -1 })
      gsap.to('.ambient-orb', { y: -20, x: 12, duration: 4.5, repeat: -1, yoyo: true, ease: 'sine.inOut', stagger: .7 })
    }, root)

    const area = cardArea.current
    const card = area?.querySelector('.auth-card')
    const onMove = (event) => {
      if (!area || !card || window.innerWidth < 768) return
      const rect = area.getBoundingClientRect()
      const x = (event.clientX - rect.left) / rect.width - 0.5
      const y = (event.clientY - rect.top) / rect.height - 0.5
      gsap.to(card, { rotateY: x * 5, rotateX: -y * 4, transformPerspective: 1000, duration: .55, ease: 'power2.out' })
    }
    const reset = () => gsap.to(card, { rotateY: 0, rotateX: 0, duration: .7, ease: 'power3.out' })
    area?.addEventListener('pointermove', onMove)
    area?.addEventListener('pointerleave', reset)

    return () => {
      area?.removeEventListener('pointermove', onMove)
      area?.removeEventListener('pointerleave', reset)
      ctx.revert()
    }
  }, [])

  return (
    <>
      <main ref={root} className="auth-shell flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="grid-overlay" />
        <div className="circuit-overlay" />
        <div className="scanline" />
        {/* <Scene /> */}
        <div className="ambient-orb pointer-events-none absolute -left-32 top-1/3 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="ambient-orb pointer-events-none absolute -right-32 top-1/4 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="ambient-orb pointer-events-none absolute bottom-[-12rem] left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-indigo-600/10 blur-3xl" />

        <section className="relative z-10 flex w-full max-w-[470px] flex-col items-center">
          <div className="auth-logo mb-4 text-center">
            <div className="auth-eyebrow mb-2 flex items-center justify-center gap-2 text-[9px] font-semibold uppercase tracking-[0.38em] text-sky-300/90 sm:text-[10px]">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_10px_#38bdf8]" />
              {eyebrow}
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_10px_#38bdf8]" />
            </div>
            <div className="auth-divider mx-auto flex w-32 items-center justify-center gap-2">
              <span className="h-px flex-1 bg-gradient-to-r from-transparent to-sky-400/60" />
              <span className="h-1.5 w-1.5 rotate-45 border border-sky-300/70" />
              <span className="h-px flex-1 bg-gradient-to-l from-transparent to-sky-400/60" />
            </div>
          </div>

          <div className="auth-heading mb-7 text-center">
            <h1 className="auth-title text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_18px_rgba(62,173,255,.12)] sm:text-[36px]">{title}</h1>
            <p className="auth-subtitle mt-2 text-sm text-slate-400">{subtitle}</p>
          </div>

          <div ref={cardArea} className="card-stage w-full [perspective:1000px]">
            {children}
          </div>

          {/* <p className="mt-5 text-center text-[9px] uppercase tracking-[0.28em] text-slate-600">Phantasm • CSE Symposium • 2026</p> */}

          <footer className="mt-5 text-center text-[9px] uppercase tracking-[0.28em] text-slate-600">Phantasm • CSE Symposium • 2026</footer>
        </section>
      </main>
    </>
  )
}
>>>>>>> 16840363 (Payment Updated)
