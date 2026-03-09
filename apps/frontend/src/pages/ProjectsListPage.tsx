
import { useNavigate, Link } from 'react-router-dom';
import { ProjectType } from '@/types/project';
import { useProjects } from '@/hooks';
import { ProjectListView, ProjectFiltersBar } from '@/components/Projects';
import { Loader2, Home, Map } from 'lucide-react';

export function ProjectsListPage() {
  const navigate = useNavigate();
  
  const {
    projects,
    loading,
    error,
    filters,
    updateFilters,
    resetFilters,
    toggleRegion,
    toggleType,
    stats,
  } = useProjects();

  const pageTitle = 'Découvrir les projets';

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-surface-beige">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-accent-coral mx-auto animate-spin" />
          <p className="mt-4 font-rubik font-semibold text-primary text-lg">
            Chargement des projets...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-surface-beige">
        <div className="text-center max-w-md p-8">
          <p className="text-text-secondary mb-6">{error.message}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-surface-beige overflow-hidden">
      {/* Header unifié */}
      <div className="bg-primary text-white px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Retour à l'accueil"
          >
            <Home className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-rubik font-semibold text-lg">{pageTitle}</h1>
            <p className="text-sm text-white/70">
              {stats.filtered} projets trouvés
            </p>
          </div>
        </div>
        
        {/* Bouton vers la carte */}
        <button
          onClick={() => navigate('/carte')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
          style={{ backgroundColor: '#f66376', color: 'white' }}
        >
          <Map className="w-4 h-4" />
          Voir sur la carte
        </button>
      </div>
      
      {/* Filters bar */}
      <ProjectFiltersBar
        filters={filters}
        onUpdateFilters={updateFilters}
        onToggleRegion={toggleRegion}
        onToggleType={(type) => toggleType(type as ProjectType)}
        onResetFilters={resetFilters}
      />
      
      {/* Project list grid */}
      <div className="flex-1 overflow-hidden">
        <ProjectListView projects={projects} />
      </div>
    </div>
  );
}
