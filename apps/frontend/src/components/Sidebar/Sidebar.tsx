import { useState } from 'react';
import { Project } from '@/types/project';
import { ProjectFilters } from '@/hooks';
import { ProjectCard } from './ProjectCard';
import { FilterPanel } from '@/components/Filters/FilterPanel';
import { ChevronLeft, ChevronRight, Filter, List, MapIcon } from 'lucide-react';
import { ProjectGauge } from '@/components/UI';

interface SidebarProps {
  projects: Project[];
  filters: ProjectFilters;
  onUpdateFilters: (filters: Partial<ProjectFilters>) => void;
  onToggleRegion: (region: string) => void;
  onToggleType: (type: string) => void;
  onResetFilters: () => void;
  selectedProject: Project | null;
  onSelectProject: (project: Project | null) => void;
  hoveredProject: Project | null;
  onHoverProject: (project: Project | null) => void;
  stats: {
    total: number;
    filtered: number;
    byType: Record<string, number>;
    byRegion: Record<string, number>;
  };
}

export function Sidebar({
  projects,
  filters,
  onUpdateFilters,
  onToggleRegion,
  onToggleType,
  onResetFilters,
  selectedProject,
  onSelectProject,
  hoveredProject,
  onHoverProject,
  stats,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'filters'>('list');

  const displayedProjects = projects.slice(0, 50);

  if (isCollapsed) {
    return (
      <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center">
        <button
          onClick={() => setIsCollapsed(false)}
          className="bg-primary text-white p-3 rounded-r-lg shadow-popup hover:bg-primary-light transition-colors"
          aria-label="Ouvrir le panneau latéral"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/30 z-10 sm:hidden"
        onClick={() => setIsCollapsed(true)}
      />
      
      <div className="absolute left-0 top-0 bottom-0 w-full sm:w-96 sm:max-w-[85vw] bg-surface-beige-light shadow-popup z-20 flex flex-col animate-slide-up">
      <div className="p-4 bg-primary text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-rubik font-semibold text-lg">Découvrir les projets</h2>
          </div>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Fermer le panneau latéral"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('list')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'list'
                ? 'bg-white text-primary'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            <List className="w-4 h-4" />
            Liste
          </button>
          <button
            onClick={() => setActiveTab('filters')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'filters'
                ? 'bg-white text-primary'
                : 'text-white/80 hover:bg-white/10'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filtres
            {(filters.search || filters.postalCode || filters.regions.length > 0 || filters.types.length > 0) && (
              <span className="w-2 h-2 bg-accent-coral rounded-full" />
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {activeTab === 'list' ? (
          <div className="p-4 space-y-3">
            {displayedProjects.length === 0 ? (
              <div className="text-center py-8 text-text-secondary">
                <MapIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium">Aucun projet trouvé</p>
                <p className="text-sm mt-1">Essayez de modifier vos filtres</p>
              </div>
            ) : (
              <>
                {displayedProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    isSelected={selectedProject?.id === project.id}
                    isHovered={hoveredProject?.id === project.id}
                    onClick={() => onSelectProject(project)}
                    onMouseEnter={() => onHoverProject(project)}
                    onMouseLeave={() => onHoverProject(null)}
                  />
                ))}
                {projects.length > 50 && (
                  <p className="text-center text-sm text-text-secondary py-2">
                    Affichage limité à 50 projets. Zoomez sur la carte pour voir plus de détails.
                  </p>
                )}
              </>
            )}
          </div>
        ) : (
          <FilterPanel
            filters={filters as any}
            onUpdateFilters={onUpdateFilters as any}
            onToggleRegion={onToggleRegion}
            onToggleType={onToggleType}
            onResetFilters={onResetFilters}
            stats={stats as any}
          />
        )}
      </div>

      <div className="p-4 bg-white border-t border-primary/10 space-y-4">
        <ProjectGauge current={stats.total} />
        
        <div className="flex items-center justify-between text-xs pt-2 border-t border-primary/5">
          <span className="text-text-secondary">
            <span className="font-semibold text-accent-coral">{stats.filtered}</span> projets filtrés
          </span>
          {(filters.search || filters.postalCode || filters.regions.length > 0 || filters.types.length > 0) && (
            <button
              onClick={onResetFilters}
              className="text-accent-magenta hover:underline font-medium"
            >
              Réinitialiser
            </button>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
