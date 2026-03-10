import { Linkedin, Mail, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-primary text-white py-3 px-4 z-20">
      <div className="max-w-screen-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Liens */}
        <div className="flex items-center gap-4">
          <a
            href="https://noe.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm hover:text-accent-coral transition-colors"
          >
            noe.org
          </a>
          <span className="text-white/30">|</span>
          <a
            href="https://www.linkedin.com/company/ong-no%C3%A9/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sm hover:text-accent-coral transition-colors"
          >
            <Linkedin className="w-4 h-4" />
            <span className="hidden sm:inline">LinkedIn</span>
          </a>
          <a
            href="mailto:contact@noe.org"
            className="flex items-center gap-1.5 text-sm hover:text-accent-coral transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span className="hidden sm:inline">Contact</span>
          </a>
        </div>

        {/* Copyright */}
        <div className="flex items-center gap-1.5 text-sm text-white/70">
          <span>Trame pollinisateur</span>
          <Heart className="w-3.5 h-3.5 text-accent-coral fill-accent-coral" />
          <span>par</span>
          <a
            href="https://noe.org"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:text-accent-coral transition-colors"
          >
            Noé
          </a>
          <span className="text-white/50">• 2026</span>
        </div>
      </div>
    </footer>
  );
}
