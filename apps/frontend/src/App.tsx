import { useState } from 'react';
import { Project, ProjectType } from '@/types/project';
import { useProjects } from '@/hooks';
import { MapView } from '@/components/Map';
import { Sidebar } from '@/components/Sidebar';
import { Loader2 } from 'lucide-react';

function App() {
  const {
    projects,
    geojson,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    toggleRegion,
    toggleType,
    stats,
  } = useProjects();

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);

  // État de chargement
  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-surface-beige">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-accent-coral mx-auto animate-spin" />
          <p className="mt-4 font-rubik font-semibold text-primary text-lg">
            Chargement des projets...
          </p>
          <p className="text-text-secondary text-sm mt-2">
            1500 projets à découvrir
          </p>
        </div>
      </div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-surface-beige">
        <div className="text-center max-w-md p-8">
          <div className="w-16 h-16 bg-accent-coral/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="font-rubik font-semibold text-primary text-xl mb-2">
            Oups, une erreur s'est produite
          </h2>
          <p className="text-text-secondary mb-6">{error.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      {/* Carte */}
      <MapView
        geojson={geojson}
        selectedProject={selectedProject}
        onSelectProject={setSelectedProject}
        hoveredProject={hoveredProject}
        onHoverProject={setHoveredProject}
      />

      {/* Sidebar */}
      <Sidebar
        projects={projects}
        filters={filters}
        onUpdateFilters={updateFilters}
        onToggleRegion={toggleRegion}
        onToggleType={(type) => toggleType(type as ProjectType)}
        onResetFilters={resetFilters}
        selectedProject={selectedProject}
        onSelectProject={setSelectedProject}
        hoveredProject={hoveredProject}
        onHoverProject={setHoveredProject}
        stats={stats}
      />

      {/* Badge compteur mobile */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 sm:hidden bg-white rounded-full px-4 py-2 shadow-popup z-10">
        <span className="font-rubik font-semibold text-primary">
          {stats.filtered}
        </span>
        <span className="text-text-secondary text-sm ml-1">projets</span>
      </div>
    </div>
  );
}

export default App;
