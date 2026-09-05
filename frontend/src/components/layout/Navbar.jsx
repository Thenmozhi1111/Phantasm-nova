<<<<<<< HEAD
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Menu, X } from 'lucide-react';

const navLinks = [
  { name: 'Home', path: '/', section: 'home' },
  { name: 'Events', path: '/events', section: 'events' },
  { name: 'Schedule', path: '/schedule', section: 'schedule' },
   { name: 'Register', path: '/register', section: null },
  { name: 'Contact', path: '/contact', section: 'contact' },
];

export default function Navbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);
  const isHomePage = location.pathname === '/';

  const handleLinkClick = (link) => {
    closeMenu();

    if (isHomePage && link.section) {
      const target = document.getElementById(link.section);
      if (target) {
        requestAnimationFrame(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/70 backdrop-blur-md border-b border-blue-500/30">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-6 py-2 md:py-3">
        <Link to="/" className="flex items-center gap-3" onClick={closeMenu}>
          <img
            src="/assets/logo-cse.png"
            alt="Phantasm CSE Logo"
            className="h-10 sm:h-12 md:h-14 w-auto object-contain brightness-150 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          />
          <div className="flex flex-col leading-none">
            <span className="font-gothic text-xl sm:text-2xl md:text-3xl text-blue-500 tracking-wider drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
              PHANTAS
            </span>
            <span className="text-[8px] sm:text-[10px] md:text-xs text-blue-500 tracking-[0.3em] font-body">
              CSE SYMPOSIUM
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-10 font-serif2 text-sm tracking-wide">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            
            

            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => handleLinkClick(link)}
                className={`relative pb-1 transition-colors ${
                  isActive ? 'text-blue-500' : 'text-slate-300 hover:text-blue-500'
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-blue-500 shadow-glow" />
                )}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login" className="hidden md:flex flex-col items-center gap-1 text-blue-500" onClick={closeMenu}>
            <div className="w-8 h-8 rounded-full border border-blue-500/50 flex items-center justify-center shadow-glow">
              <User size={16} />
            </div>
            <span className="text-[10px] tracking-wide">Login</span>
          </Link>

          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-md border border-blue-500/40 text-blue-500 shadow-glow"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-black/95 border-t border-blue-500/30 ${
          menuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex flex-col px-6 py-4 gap-4 font-serif2 text-base tracking-wide">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={closeMenu}
                className={`py-1 border-b border-blue-500/20 transition-colors ${
                  isActive ? 'text-blue-500' : 'text-slate-300'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          <Link
            to="/login"
            onClick={closeMenu}
            className="flex items-center gap-2 text-blue-500 py-1"
          >
            <div className="w-7 h-7 rounded-full border border-blue-500/50 flex items-center justify-center shadow-glow">
              <User size={14} />
            </div>
            <span className="text-sm tracking-wide">Login</span>
          </Link>
        </div>
      </div>
    </nav>
  );
=======
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Menu, X } from 'lucide-react';

const navLinks = [
  { name: 'Home', path: '/', section: 'home' },
  { name: 'Events', path: '/events', section: 'events' },
  { name: 'Schedule', path: '/schedule', section: 'schedule' },
   { name: 'Register', path: '/register', section: null },
  { name: 'Contact', path: '/contact', section: 'contact' },
];

export default function Navbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);
  const isHomePage = location.pathname === '/';

  const handleLinkClick = (link) => {
    closeMenu();

    if (isHomePage && link.section) {
      const target = document.getElementById(link.section);
      if (target) {
        requestAnimationFrame(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
      }
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-black/70 backdrop-blur-md border-b border-blue-500/30">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-6 py-2 md:py-3">
        <Link to="/" className="flex items-center gap-3" onClick={closeMenu}>
          <img
            src="/assets/logo-cse.png"
            alt="Phantasm CSE Logo"
            className="h-10 sm:h-12 md:h-14 w-auto object-contain brightness-150 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]"
          />
          <div className="flex flex-col leading-none">
            <span className="font-gothic text-xl sm:text-2xl md:text-3xl text-blue-500 tracking-wider drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">
              PHANTAS
            </span>
            <span className="text-[8px] sm:text-[10px] md:text-xs text-blue-500 tracking-[0.3em] font-body">
              CSE SYMPOSIUM
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-10 font-serif2 text-sm tracking-wide">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            
            

            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => handleLinkClick(link)}
                className={`relative pb-1 transition-colors ${
                  isActive ? 'text-blue-500' : 'text-slate-300 hover:text-blue-500'
                }`}
              >
                {link.name}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-blue-500 shadow-glow" />
                )}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login" className="hidden md:flex flex-col items-center gap-1 text-blue-500" onClick={closeMenu}>
            <div className="w-8 h-8 rounded-full border border-blue-500/50 flex items-center justify-center shadow-glow">
              <User size={16} />
            </div>
            <span className="text-[10px] tracking-wide">Login</span>
          </Link>

          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-md border border-blue-500/40 text-blue-500 shadow-glow"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-black/95 border-t border-blue-500/30 ${
          menuOpen ? 'max-h-80 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="flex flex-col px-6 py-4 gap-4 font-serif2 text-base tracking-wide">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={closeMenu}
                className={`py-1 border-b border-blue-500/20 transition-colors ${
                  isActive ? 'text-blue-500' : 'text-slate-300'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
          <Link
            to="/login"
            onClick={closeMenu}
            className="flex items-center gap-2 text-blue-500 py-1"
          >
            <div className="w-7 h-7 rounded-full border border-blue-500/50 flex items-center justify-center shadow-glow">
              <User size={14} />
            </div>
            <span className="text-sm tracking-wide">Login</span>
          </Link>
        </div>
      </div>
    </nav>
  );
>>>>>>> 16840363 (Payment Updated)
}