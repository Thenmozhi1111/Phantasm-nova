<<<<<<< HEAD
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

      

      <section id="schedule" className="scroll-mt-24">
        <Schedule showNavbar={false} />
      </section>

      <section id="contact" className="scroll-mt-24">
        <ContactUsPage showNavbar={false} />
      </section>
    </div>
  );
}
=======
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

      

      <section id="schedule" className="scroll-mt-24">
        <Schedule showNavbar={false} />
      </section>

      <section id="contact" className="scroll-mt-24">
        <ContactUsPage showNavbar={false} />
      </section>
    </div>
  );
}
>>>>>>> 16840363 (Payment Updated)
