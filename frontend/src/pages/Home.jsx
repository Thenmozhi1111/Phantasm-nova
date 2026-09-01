import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import EventCatalog from '../components/EventCatalog';
import ContactUsPage from '../components/ContactUsPage';
import Schedule from './Schedule';

export default function Home() {
  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />

      <section id="home">
        <Hero />
      </section>

      <section id="events" className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-12 sm:px-10">
        <div className="mb-10 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.5em] text-sky-300/80">
            Phantasm 2026
          </p>
          <h2 className="mt-3 font-serif text-4xl tracking-[0.2em] text-sky-50 drop-shadow-[0_0_20px_rgba(56,189,248,0.4)]">
            ALL QUESTS
          </h2>
        </div>
        <EventCatalog />
      </section>

      <section id="schedule" className="scroll-mt-24">
        <Schedule showNavbar={false} />
      </section>

      <section id="contact" className="scroll-mt-24">
        <ContactUsPage showNavbar={false} />
      </section>
    </div>
  );
}
