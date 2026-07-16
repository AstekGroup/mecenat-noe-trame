import { ExternalLink, Mail } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';

export function Header() {
  return (
    <header className="bg-primary text-white py-3 px-4 shadow-lg z-20">
      <div className="max-w-screen-2xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          {/* Logo et titre */}
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-3 hover:opacity-90 transition-opacity"
            >
              <div className="flex flex-col">
                <span className="font-rubik font-bold text-lg sm:text-xl leading-none">
                  TRAME
                </span>
                <span className="font-rubik font-bold text-accent-coral text-xl sm:text-2xl leading-none">
                  POLLINISATEUR
                </span>
                <span className="font-rubik font-bold text-sm sm:text-base leading-none">
                  PAR NOÉ
                </span>
              </div>
            </Link>

            <div className="hidden sm:block h-10 w-px bg-white/20" />

            <div className="hidden sm:block">
              <span className="text-sm text-white/80">Carte interactive</span>
              <p className="font-semibold text-lg leading-tight">Projets en France</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <div className="bg-white/10 rounded-lg px-4 py-2 backdrop-blur-sm">
              <span className="text-sm text-white/80">Initiative</span>
              <p className="font-rubik font-bold text-lg">Préservation Biodiversité</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href="https://noe.org/contact"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 sm:px-4 sm:py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex items-center gap-2"
              title="Contactez-nous"
            >
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline text-sm font-medium">Contact</span>
            </a>
            <a
              href="https://noe.org"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 sm:px-4 py-2 rounded-lg bg-accent-coral hover:bg-accent-coral-dark transition-colors flex items-center gap-2 text-sm font-semibold"
            >
              <span className="hidden sm:inline">Visiter Noé</span>
              <span className="sm:hidden">Noé</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        <nav aria-label="Navigation principale" className="mt-3 flex border-t border-white/20 pt-3">
          {[
            ['/', 'Accueil'],
            ['/carte', 'Carte'],
            ['/projets', 'Liste des projets'],
          ].map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex-1 rounded-lg px-3 py-2 text-center text-sm font-medium transition-colors ${
                  isActive ? 'bg-white text-primary' : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
