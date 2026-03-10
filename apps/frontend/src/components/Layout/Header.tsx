import { ExternalLink, Mail } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-primary text-white py-3 px-4 shadow-lg z-20">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
        {/* Logo et titre */}
        <div className="flex items-center gap-4">
          <a
            href="https://noe.org"
            target="_blank"
            rel="noopener noreferrer"
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
          </a>
          
          <div className="hidden sm:block h-10 w-px bg-white/20" />
          
          <div className="hidden sm:block">
            <span className="text-sm text-white/80">Carte interactive</span>
            <p className="font-semibold text-lg leading-tight">Projets en France</p>
          </div>
        </div>

        {/* Date / Label */}
        <div className="hidden md:flex items-center gap-6">
          <div className="bg-white/10 rounded-lg px-4 py-2 backdrop-blur-sm">
            <span className="text-sm text-white/80">Initiative</span>
            <p className="font-rubik font-bold text-lg">Préservation Biodiversité</p>
          </div>
        </div>

        {/* Actions */}
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
    </header>
  );
}
