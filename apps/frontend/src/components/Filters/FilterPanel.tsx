import { ProjectFilters } from '@/hooks';
import { ProjectType, PROJECT_TYPE_LABELS, PROJECT_TYPE_COLORS, REGIONS } from '@/types/project';
import { MapPin, Tag, RotateCcw, Search, X, Hash, Layers } from 'lucide-react';
import { Button } from '@/components/UI';
import { FilterAccordion } from './FilterAccordion';
import { TYPE_ICONS } from '@/components/Map/ProjectMarker';

interface FilterPanelProps {
  filters: ProjectFilters;
  onUpdateFilters: (filters: Partial<ProjectFilters>) => void;
  onToggleRegion: (region: string) => void;
  onToggleType: (type: string) => void;
  onResetFilters: () => void;
  stats: {
    total: number;
    filtered: number;
    byType: Record<string, number>;
    byRegion: Record<string, number>;
  };
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

export function FilterPanel({
  filters,
  onUpdateFilters,
  onToggleRegion,
  onToggleType,
  onResetFilters,
}: FilterPanelProps) {
  const hasActiveFilters =
    filters.search ||
    filters.postalCode ||
    filters.regions.length > 0 ||
    filters.types.length > 0 ||
    filters.showNatura2000 ||
    !filters.showCorridors || // Show reset if corridors is hidden (since it's default)
    filters.showParcsNationaux ||
    filters.showParcsNaturelsRegionaux ||
    filters.showReservesNaturelles ||
    filters.showRegions ||
    filters.showDepartments ||
    filters.showEPCI ||
    filters.showCommunes;

  return (
    <div className="flex flex-col h-full">
      {/* Recherche intégrée */}
      <div className="p-4 border-b border-primary/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onUpdateFilters({ search: e.target.value })}
            placeholder="Rechercher..."
            className="w-full pl-9 pr-9 py-2.5 bg-white border border-primary/20 rounded-lg text-sm text-text-primary placeholder:text-text-secondary/70 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
          {filters.search && (
            <button
              onClick={() => onUpdateFilters({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary transition-colors"
              aria-label="Effacer la recherche"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {/* Filtre par type avec pictos */}
        <FilterAccordion
          title="Type de projet"
          icon={<Tag className="w-4 h-4" />}
          defaultOpen={filters.types.length > 0}
          badge={filters.types.length}
        >
          <div className="space-y-6">
            {PROJECT_TYPE_GROUPS.map((group) => (
              <div key={group.title}>
                <h4 className="text-[10px] text-text-secondary mb-3 font-medium uppercase tracking-wider border-b border-primary/5 pb-1">
                  {group.title}
                </h4>
                <div className="space-y-2">
                  {group.types.map((type) => {
                    const Icon = TYPE_ICONS[type];
                    const color = PROJECT_TYPE_COLORS[type];
                    return (
                      <label
                        key={type}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={filters.types.includes(type)}
                          onChange={() => onToggleType(type)}
                          className="w-4 h-4 text-accent-coral border-primary/30 rounded focus:ring-accent-coral"
                        />
                        <div
                          className="w-6 h-6 rounded-md flex items-center justify-center"
                          style={{ backgroundColor: color }}
                        >
                          <Icon className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                          {PROJECT_TYPE_LABELS[type]}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </FilterAccordion>

        {/* Calques optionnels */}
        <FilterAccordion
          title="Calques"
          icon={<Layers className="w-4 h-4" />}
          defaultOpen={filters.showCorridors || filters.showNatura2000 || filters.showParcsNationaux || filters.showParcsNaturelsRegionaux || filters.showReservesNaturelles || filters.showRegions || filters.showDepartments || filters.showEPCI || filters.showCommunes}
        >
          <div className="space-y-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.showCorridors}
                onChange={() => onUpdateFilters({ showCorridors: !filters.showCorridors })}
                className="w-4 h-4 text-accent-coral border-primary/30 rounded focus:ring-accent-coral"
              />
              <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                Corridors (Trame pollinisateur)
              </span>
            </label>

            <div className="pt-2 mt-2 border-t border-primary/10">
              <p className="text-[10px] text-text-secondary mb-2 font-medium uppercase tracking-wider">Espaces Protégés</p>
              
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.showParcsNationaux}
                    onChange={() => onUpdateFilters({ showParcsNationaux: !filters.showParcsNationaux })}
                    className="w-4 h-4 text-accent-coral border-primary/30 rounded focus:ring-accent-coral"
                  />
                  <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                    Parcs Nationaux
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.showParcsNaturelsRegionaux}
                    onChange={() => onUpdateFilters({ showParcsNaturelsRegionaux: !filters.showParcsNaturelsRegionaux })}
                    className="w-4 h-4 text-accent-coral border-primary/30 rounded focus:ring-accent-coral"
                  />
                  <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                    Parcs Naturels Régionaux
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.showReservesNaturelles}
                    onChange={() => onUpdateFilters({ showReservesNaturelles: !filters.showReservesNaturelles })}
                    className="w-4 h-4 text-accent-coral border-primary/30 rounded focus:ring-accent-coral"
                  />
                  <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                    Réserves Naturelles
                  </span>
                </label>

                <div
                  className="flex items-start gap-3 text-text-secondary/70"
                  aria-disabled="true"
                >
                  <input
                    type="checkbox"
                    disabled
                    className="w-4 h-4 border-primary/20 rounded mt-0.5"
                  />
                  <span className="text-sm">
                    Réserves Biologiques
                    <span className="block text-xs">Données non disponibles</span>
                  </span>
                </div>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.showNatura2000}
                    onChange={() => onUpdateFilters({ showNatura2000: !filters.showNatura2000 })}
                    className="w-4 h-4 text-accent-coral border-primary/30 rounded focus:ring-accent-coral"
                  />
                  <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                    Zones Natura 2000
                  </span>
                </label>
              </div>
            </div>

            <div className="pt-2 mt-2 border-t border-primary/10">
              <p className="text-[10px] text-text-secondary mb-2 font-medium uppercase tracking-wider">Limites administratives (IGN)</p>
              
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.showRegions}
                    onChange={() => onUpdateFilters({ showRegions: !filters.showRegions })}
                    className="w-4 h-4 text-accent-coral border-primary/30 rounded focus:ring-accent-coral"
                  />
                  <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                    Régions
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.showDepartments}
                    onChange={() => onUpdateFilters({ showDepartments: !filters.showDepartments })}
                    className="w-4 h-4 text-accent-coral border-primary/30 rounded focus:ring-accent-coral"
                  />
                  <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                    Départements
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.showEPCI}
                    onChange={() => onUpdateFilters({ showEPCI: !filters.showEPCI })}
                    className="w-4 h-4 text-accent-coral border-primary/30 rounded focus:ring-accent-coral"
                  />
                  <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                    Intercommunalités (EPCI)
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.showCommunes}
                    onChange={() => onUpdateFilters({ showCommunes: !filters.showCommunes })}
                    className="w-4 h-4 text-accent-coral border-primary/30 rounded focus:ring-accent-coral"
                  />
                  <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                    Communes
                  </span>
                </label>
              </div>
            </div>
          </div>
        </FilterAccordion>

        {/* Filtre par code postal */}
        <FilterAccordion
          title="Code postal"
          icon={<Hash className="w-4 h-4" />}
          defaultOpen={!!filters.postalCode}
        >
          <div className="relative">
            <input
              type="text"
              value={filters.postalCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                onUpdateFilters({ postalCode: value });
              }}
              placeholder="Ex: 75, 75001..."
              maxLength={5}
              className="w-full px-3 py-2 bg-white border border-primary/20 rounded-lg text-sm text-text-primary placeholder:text-text-secondary/70 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            {filters.postalCode && (
              <button
                onClick={() => onUpdateFilters({ postalCode: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-primary transition-colors"
                aria-label="Effacer le code postal"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <p className="text-xs text-text-secondary mt-2">
            Entrez un code postal ou son début (ex: 75 pour Paris)
          </p>
        </FilterAccordion>

        {/* Filtre par région */}
        <FilterAccordion
          title="Région"
          icon={<MapPin className="w-4 h-4" />}
          defaultOpen={filters.regions.length > 0}
          badge={filters.regions.length}
        >
          <div className="space-y-2">
            <div className="space-y-2">
              {REGIONS.filter(r => !['Guadeloupe', 'Martinique', 'Guyane', 'La Réunion', 'Mayotte'].includes(r)).map((region) => (
                <label
                  key={region}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={filters.regions.includes(region)}
                    onChange={() => onToggleRegion(region)}
                    className="w-4 h-4 text-accent-coral border-primary/30 rounded focus:ring-accent-coral"
                  />
                  <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                    {region}
                  </span>
                </label>
              ))}
            </div>
            
            <div className="pt-3 mt-3 border-t border-primary/10">
              <p className="text-xs text-text-secondary mb-2 font-medium uppercase tracking-wide">Outre-mer</p>
              <div className="space-y-2">
                {REGIONS.filter(r => ['Guadeloupe', 'Martinique', 'Guyane', 'La Réunion', 'Mayotte'].includes(r)).map((region) => (
                  <label
                    key={region}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={filters.regions.includes(region)}
                      onChange={() => onToggleRegion(region)}
                      className="w-4 h-4 text-accent-coral border-primary/30 rounded focus:ring-accent-coral"
                    />
                    <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                      {region}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </FilterAccordion>
      </div>

      {hasActiveFilters && (
        <div className="p-4 border-t border-primary/10 bg-white">
          <Button
            variant="outline"
            size="sm"
            onClick={onResetFilters}
            className="w-full"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Réinitialiser les filtres
          </Button>
        </div>
      )}
    </div>
  );
}
