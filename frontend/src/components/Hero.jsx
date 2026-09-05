import CountdownTimer from './CountdownTimer';
import { CalendarDays, ChevronDown, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section className="relative w-full min-h-screen bg-black overflow-x-hidden flex items-start justify-start pt-18 md:pt-20">
      {/* Background layer - Full viewport coverage */}
      <div className="absolute inset-0 top-0 bg-black w-full h-full">
        {/* Keep the wide composition for desktop and use the transparent artwork on mobile. */}
        <img
          src="/assets/hero-bg.jpg"
          alt="Phantasm hero background"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover hidden md:block"
          style={{ objectPosition: 'center 18%' }}
        />

        <img
  src="/assets/image.png"
  alt=""
  aria-hidden="true"
  className="mobile-dragon absolute md:hidden left-1/2 -translate-x-1/2 w-[115%] max-w-none h-full object-cover object-center"
  style={{ objectPosition: 'center center' }}
/>
        {/* Gradient overlays optimized for mobile and desktop */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/30 via-80% to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent via-50% to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent" />
      </div>

      {/* Content */}
      
        <div className="relative z-10 max-w-7xl w-full px-5 sm:px-6 md:px-[90px] min-h-screen flex flex-col md:flex-row md:items-start">
        <div className="hero-copy max-w-xl w-full flex flex-col justify-start pt-[32px] md:pt-[40px] md:h-auto h-auto pb-10 md:pb-0">
          <p className="text-blue-400 text-[10px] sm:text-xs md:text-sm tracking-[0.3em] font-body mb-3 sm:mb-4">
            WELCOME TO
          </p>

         <h1 className="font-gothic text-4xl sm:text-4xl md:text-6xl lg:text-6xl text-white leading-tight sm:leading-none drop-shadow-[0_0_25px_rgba(96,165,250,0.5)]">
        PHANTASM NOVA
        </h1>
          <p className="font-serif2 text-blue-200 text-base sm:text-lg md:text-xl tracking-[0.35em] mt-2">
            CSE SYMPOSIUM 2026
          </p>

          <div className="w-16 sm:w-20 h-[2px] bg-blue-500 shadow-glow my-3 sm:my-4" />

          <p className="font-serif2 italic text-slate-200 text-base sm:text-lg md:text-xl mb-2 sm:mb-3">
            Ideate • Innovate • Transcend
          </p>

          <p className="max-w-xl font-serif2 font-semibold tracking-wide text-sm sm:text-base md:text-lg leading-relaxed text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-cyan-200 to-blue-400 drop-shadow-[0_0_14px_rgba(96,165,250,0.65)] mb-3 sm:mb-4">
            A national-level technical symposium where bright minds meet, create, and shape the future.
          </p>

          <p className="text-blue-400 text-sm sm:text-base tracking-[0.3em] font-body mb-3">
            THE COUNTDOWN BEGINS
          </p>

          <CountdownTimer />

        

          <div className="mt-4 sm:mt-5 inline-flex w-fit items-center gap-4 sm:gap-5 rounded-md border border-blue-400/35 bg-blue-950/25 px-4 py-3 text-slate-200 shadow-[0_0_24px_rgba(59,130,246,0.2)] backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <CalendarDays className="text-blue-400" size={15} />
              <div>
                <span className="block text-xs sm:text-sm text-blue-300 tracking-[0.2em] font-body">DATE</span>
                <span className="font-serif2 text-base sm:text-lg tracking-wide">22/09/26</span>
              </div>
            </div>
            <span className="h-8 w-px bg-blue-400/30" />
            <div className="flex items-center gap-2">
              <Trophy className="text-blue-400" size={15} />
              <div>
                <span className="block text-xs sm:text-sm text-blue-300 tracking-[0.2em] font-body">POOL PRIZE</span>
                <span className="font-serif2 text-base sm:text-lg tracking-wide">upto 30,000</span>
              </div>
            </div>
            
          </div>
          {/* Explore Events Button */}
{/* Explore Events Button - Mobile Only */}
<div className="flex sm:hidden justify-center mt-12">
  <Link
    to='/events'
    className="
      inline-flex 
      items-center 
      justify-center 
      rounded-lg 
      border border-blue-400/60 
      bg-blue-600/15 
      px-6 
      py-3 
      text-sm 
      sm:text-base 
      font-semibold 
      tracking-[0.15em] 
      text-blue-300 
      shadow-[0_0_20px_rgba(59,130,246,0.25)] 
      backdrop-blur-sm 
      transition-all 
      duration-300 
      hover:bg-blue-500/20 
      hover:border-blue-400 
      hover:text-white 
      hover:shadow-[0_0_30px_rgba(59,130,246,0.45)] 
      active:scale-95 
    "
  >
    EXPLORE EVENTS
  </Link>
</div>
        </div>
      </div>

      {/* Scroll to explore - Hidden on mobile, visible on tablet+ */}
      {/* Explore Events + Scroll to Explore */}
<div className="hidden sm:flex absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-10 flex-col items-center">

  <Link
    to='/events'
    className="mb-4 inline-flex items-center justify-center rounded-md border border-blue-400 bg-blue-950/40 px-6 py-2.5 text-sm font-semibold tracking-[0.2em] text-blue-200 transition-all duration-300 hover:bg-blue-500/20 hover:text-white hover:shadow-[0_0_25px_rgba(59,130,246,0.6)]"
  >
    EXPLORE EVENTS
  </Link>

  <div className="flex flex-col items-center gap-1 animate-bounce">
    <ChevronDown className="text-blue-400" size={18} />
    <span className="text-blue-300 text-xs sm:text-sm tracking-[0.3em] font-body">
      SCROLL TO EXPLORE
    </span>
  </div>
  

</div>

    </section>
  );
}
