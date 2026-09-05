<<<<<<< HEAD
// Schedule.jsx
// Route this at /schedule. Desktop gets the full constellation map;
// below the `lg` breakpoint it swaps to the vertical unrolled timeline.

import Navbar from "../components/Navbar";
import DesktopConstellation from "../schedule/DesktopConstellation";
import MobileTimeline from "../schedule/MobileTimeline";
import "../styles/schedule.css";

export default function Schedule({ showNavbar = true }) {
  return (
    <div className="min-h-screen bg-phantasm-navy text-white font-body relative overflow-hidden">
      {showNavbar && <Navbar />}

      <div className="starfield" />
      <div className="glow-arc" />

      <section className="relative z-10 text-center pt-14 md:pt-16 pb-6 px-6 border-b border-blue-500/40">
        <p className="text-[11px] tracking-[4px] text-blue-500 mb-3 font-body">THE STAR CHART</p>
        <h1
          className="font-gothic text-4xl md:text-5xl tracking-wide text-white"
          style={{ textShadow: "0 0 20px rgba(59,130,246,.35)" }}
        >
          SCHEDULE
        </h1>
        <p className="font-serif2 text-slate-400 text-sm mt-3 max-w-md mx-auto">
          One day, one path — trace it from the opening ceremony to the final applause.
        </p>
      </section>

      {/* Desktop map */}
      <section className="relative z-10 hidden lg:block max-w-6xl mx-auto px-10 py-20">
        <DesktopConstellation />
        <p className="text-center text-[11px] text-slate-500 mt-10">
          Hover a star for details · junction points mark where the two parallel tracks split
        </p>
      </section>

      {/* Mobile timeline */}
      <section className="relative z-10 lg:hidden px-5 py-10">
        <MobileTimeline />
      </section>
    </div>
  );
}
=======
// Schedule.jsx
// Route this at /schedule. Desktop gets the full constellation map;
// below the `lg` breakpoint it swaps to the vertical unrolled timeline.

import Navbar from "../components/Navbar";
import DesktopConstellation from "../schedule/DesktopConstellation";
import MobileTimeline from "../schedule/MobileTimeline";
import "../styles/schedule.css";

export default function Schedule({ showNavbar = true }) {
  return (
    <div className="min-h-screen bg-phantasm-navy text-white font-body relative overflow-hidden">
      {showNavbar && <Navbar />}

      <div className="starfield" />
      <div className="glow-arc" />

      <section className="relative z-10 text-center pt-14 md:pt-16 pb-6 px-6 border-b border-blue-500/40">
        <p className="text-[11px] tracking-[4px] text-blue-500 mb-3 font-body">THE STAR CHART</p>
        <h1
          className="font-gothic text-4xl md:text-5xl tracking-wide text-white"
          style={{ textShadow: "0 0 20px rgba(59,130,246,.35)" }}
        >
          SCHEDULE
        </h1>
        <p className="font-serif2 text-slate-400 text-sm mt-3 max-w-md mx-auto">
          One day, one path — trace it from the opening ceremony to the final applause.
        </p>
      </section>

      {/* Desktop map */}
      <section className="relative z-10 hidden lg:block max-w-6xl mx-auto px-10 py-20">
        <DesktopConstellation />
        <p className="text-center text-[11px] text-slate-500 mt-10">
          Hover a star for details · junction points mark where the two parallel tracks split
        </p>
      </section>

      {/* Mobile timeline */}
      <section className="relative z-10 lg:hidden px-5 py-10">
        <MobileTimeline />
      </section>
    </div>
  );
}
>>>>>>> 16840363 (Payment Updated)
