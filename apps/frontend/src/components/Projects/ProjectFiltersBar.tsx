import { useState, useRef, useEffect } from 'react';
import { ProjectFilters } from '@/hooks';
import { ProjectType, PROJECT_TYPE_LABELS, PROJECT_TYPE_COLORS, REGIONS } from '@/types/project';
import { ChevronDown, RotateCcw, X, Search } from 'lucide-react';

interface ProjectFiltersBarProps {
  filters: ProjectFilters;
  onUpdateFilters: (filters: Partial<ProjectFilters>) => void;
  onToggleRegion: (region: string) => void;
  onToggleType: (type: string) => void;
  onResetFilters: () => void;
}

const PROJECT_TYPE_GROUPS = [
  {
    title: 'Actions directes sur les milieux',
    types: ['pratiques-raisonnees', 'renaturation-restauration'] as ProjectType[],
  },
  {
    title: 'Actions indirectes sur les milieux',
    types: ['sensibilisation', 'formation', 'consultation', 'suivis'] as ProjectType[],
  },
];

interface FilterDropdownProps {
  label: string;
  children: React.ReactNode;
  badge?: number;
}

function FilterDropdown({ label, children, badge }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          badge ? 'bg-primary text-white' : 'bg-white text-primary hover:bg-primary/5'
        }`}
      >
        {label}
        {badge ? (
          <span className="bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full">
            {badge}
          </span>
        ) : null}
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-popup z-50 min-w-[240px] max-h-[400px] overflow-y-auto">
          {children}
        </div>
      )}
    </div>
  );
}

export function ProjectFiltersBar({
  filters,
  onUpdateFilters,
  onToggleRegion,
  onToggleType,
  onResetFilters,
}: ProjectFiltersBarProps) {
  const hasActiveFilters =
    filters.search ||
    filters.postalCode ||
    filters.regions.length > 0 ||
    filters.types.length > 0;

  // Collecte des tags actifs
  const activeTags: { key: string; label: string; onRemove: () => void }[] = [];

  filters.types.forEach((type) => {
    activeTags.push({
      key: `type-${type}`,
      label: PROJECT_TYPE_LABELS[type as ProjectType] || type,
      onRemove: () => onToggleType(type),
    });
  });

  if (filters.postalCode) {
    activeTags.push({
      key: 'postalCode',
      label: `CP: ${filters.postalCode}`,
      onRemove: () => onUpdateFilters({ postalCode: '' }),
    });
  }

  filters.regions.forEach((region) => {
    activeTags.push({
      key: `region-${region}`,
      label: region,
      onRemove: () => onToggleRegion(region),
    });
  });

  return (
    <div className="flex flex-col gap-3 p-4 bg-surface-beige border-b border-primary/10">
      {/* Top row: Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onUpdateFilters({ search: e.target.value })}
            placeholder="Rechercher par titre, description, ville..."
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-primary/20 rounded-xl text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          {filters.search && (
            <button
              onClick={() => onUpdateFilters({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom row: Other filters */}
      <div className="flex flex-wrap items-center gap-2">
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-accent-magenta hover:bg-accent-magenta/10 rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Réinitialiser
          </button>
        )}
        
        {/* Type filter */}
        <FilterDropdown
          label="Type de projet"
          badge={filters.types.length || undefined}
        >
          <div className="p-3 space-y-4">
            {PROJECT_TYPE_GROUPS.map((group) => (
              <div key={group.title} className="space-y-1">
                <h4 className="text-[10px] text-text-secondary mb-2 font-medium uppercase tracking-wider border-b border-primary/5 pb-1">
                  {group.title}
                </h4>
                {group.types.map((type) => {
                  const color = PROJECT_TYPE_COLORS[type];
                  return (
                    <label
                      key={type}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-pointer hover:bg-primary/5 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={filters.types.includes(type)}
                        onChange={() => onToggleType(type)}
                        className="w-4 h-4 text-accent-coral border-primary/30 rounded focus:ring-accent-coral"
                      />
                      <span
                        className="w-3 h-3 rounded flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className={filters.types.includes(type) ? 'text-primary font-medium text-xs' : 'text-text-secondary text-xs'}>
                        {PROJECT_TYPE_LABELS[type]}
                      </span>
                    </label>
                  );
                })}
              </div>
            ))}
          </div>
        </FilterDropdown>
        
        {/* Postal code filter */}
        <div className="relative">
          <input
            type="text"
            value={filters.postalCode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 5);
              onUpdateFilters({ postalCode: value });
            }}
            placeholder="Code postal"
            className={`w-32 px-3 py-2 rounded-lg text-sm border transition-colors ${
              filters.postalCode
                ? 'bg-primary text-white border-primary placeholder:text-white/70'
                : 'bg-white text-primary border-primary/20 placeholder:text-text-secondary'
            }`}
          />
          {filters.postalCode && (
            <button
              onClick={() => onUpdateFilters({ postalCode: '' })}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        
        {/* Region filter */}
        <FilterDropdown
          label="Région"
          badge={filters.regions.length || undefined}
        >
          <div className="p-2 space-y-1 max-h-[250px] overflow-y-auto scrollbar-thin">
            {REGIONS.map((region) => (
              <label
                key={region}
                className="flex items-center gap-2 px-3 py-2 rounded-md text-sm cursor-pointer hover:bg-primary/5 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={filters.regions.includes(region)}
                  onChange={() => onToggleRegion(region)}
                  className="w-4 h-4 text-accent-coral border-primary/30 rounded focus:ring-accent-coral"
                />
                <span className={filters.regions.includes(region) ? 'text-primary font-medium' : 'text-text-secondary'}>
                  {region}
                </span>
              </label>
            ))}
          </div>
        </FilterDropdown>
      </div>

      {/* Active filter tags */}
      {activeTags.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {activeTags.map((tag) => (
            <span
              key={tag.key}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
            >
              {tag.label}
              <button
                onClick={tag.onRemove}
                className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            onClick={onResetFilters}
            className="text-xs text-accent-magenta hover:underline font-medium"
          >
            Tout effacer
          </button>
        </div>
      )}
    </div>
  );
}
