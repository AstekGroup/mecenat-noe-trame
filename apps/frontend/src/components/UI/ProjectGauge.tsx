import React from 'react';

interface ProjectGaugeProps {
  current: number;
  target?: number;
  className?: string;
  showText?: boolean;
  variant?: 'default' | 'hero';
}

export function ProjectGauge({
  current,
  target = 1000,
  className = '',
  showText = true,
  variant = 'default',
}: ProjectGaugeProps) {
  const percentage = Math.min(Math.round((current / target) * 100), 100);
  
  const isHero = variant === 'hero';

  return (
    <div className={`w-full ${className}`}>
      {showText && (
        <div className="flex justify-between items-end mb-2">
          <span className={`text-sm font-medium ${isHero ? 'text-white' : 'text-primary'}`}>
            <span className={`text-xl font-bold ${isHero ? 'text-accent-coral' : 'text-accent-coral'}`}>{current}</span>
            <span className={`ml-1.5 ${isHero ? 'text-white/80' : 'text-text-secondary'}`}>projets recensés</span>
          </span>
          <span className={`text-xs font-bold uppercase tracking-widest ${isHero ? 'text-white/60' : 'text-text-secondary'}`}>
            Objectif {target}
          </span>
        </div>
      )}
      <div className={`h-3 w-full rounded-full overflow-hidden border shadow-inner ${
        isHero ? 'bg-white/10 border-white/10' : 'bg-primary/5 border-primary/5'
      }`}>
        <div
          className="h-full bg-accent-coral transition-all duration-1000 ease-out rounded-full relative"
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
      </div>
    </div>
  );
}
