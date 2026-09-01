import Navbar from '../components/layout/Navbar';
import RegistrationForm from '../components/RegistrationForm';

export default function Payment() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <main className="pt-24 pb-20">
        <RegistrationForm />
      </main>
    </div>
  );
}
