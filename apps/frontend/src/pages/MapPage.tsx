import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project, ProjectType } from '@/types/project';
import { useProjects } from '@/hooks';
import { MapView } from '@/components/Map';
import { Sidebar } from '@/components/Sidebar';
import { SearchOverlay } from '@/components/Map/SearchOverlay';
import { Header, Footer } from '@/components/Layout';
import { Loader2, Filter } from 'lucide-react';

export interface MapViewHandle {
  flyTo: (lng: number, lat: number, zoom?: number) => void;
}

export function MapPage() {
  const navigate = useNavigate();
  
  const {
    projects,
    geojson,
    natura2000Data,
    corridorsData,
    parcsNationauxData,
    parcsNaturelsRegionauxData,
    reservesNaturellesData,
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
  const [mobileShowSidebar, setMobileShowSidebar] = useState(false);
  const mapFlyToRef = useRef<((lng: number, lat: number, zoom?: number) => void) | null>(null);

  const handleViewDetails = (projectId: string) => {
    navigate(`/projet/${projectId}`);
  };

  const handleSidebarProjectClick = useCallback((project: Project | null) => {
    setSelectedProject(project);
    if (project && mapFlyToRef.current) {
      mapFlyToRef.current(project.longitude, project.latitude, 14);
    }
  }, []);

  const handleSearchFlyTo = useCallback((lng: number, lat: number, zoom: number) => {
    if (mapFlyToRef.current) {
      mapFlyToRef.current(lng, lat, zoom);
    }
  }, []);

  const handleSearchFilter = useCallback((search: string) => {
    updateFilters({ search });
  }, [updateFilters]);

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
    <div className="min-h-screen bg-surface-beige-light flex flex-col">
      <Header />

      <main className="flex-1 py-8 sm:py-10">
        <section className="max-w-5xl mx-auto px-4 mb-6" aria-labelledby="map-title">
          <p className="font-rubik font-semibold text-accent-coral mb-2">Trame pollinisateur</p>
          <h1 id="map-title" className="font-rubik text-3xl sm:text-4xl font-bold text-primary">
            Explorer les projets
          </h1>
          <p className="mt-3 max-w-3xl text-text-secondary">
            Recherchez les initiatives, filtrez la carte et découvrez les corridors favorables aux pollinisateurs en France et dans les territoires ultramarins.
          </p>
        </section>

        <section
          aria-label="Carte interactive des projets"
          className="relative h-[72svh] min-h-[560px] max-h-[820px] overflow-hidden bg-white shadow-popup sm:mx-4 sm:rounded-2xl"
        >
          <SearchOverlay
            onFlyTo={handleSearchFlyTo}
            onSearchFilter={handleSearchFilter}
            searchValue={filters.search}
          />

          <MapView
            geojson={geojson}
            natura2000Data={natura2000Data}
            corridorsData={corridorsData}
            parcsNationauxData={parcsNationauxData}
            parcsNaturelsRegionauxData={parcsNaturelsRegionauxData}
            reservesNaturellesData={reservesNaturellesData}
            showNatura2000={filters.showNatura2000}
            showCorridors={filters.showCorridors}
            showParcsNationaux={filters.showParcsNationaux}
            showParcsNaturelsRegionaux={filters.showParcsNaturelsRegionaux}
            showReservesNaturelles={filters.showReservesNaturelles}
            showRegions={filters.showRegions}
            showDepartments={filters.showDepartments}
            showEPCI={filters.showEPCI}
            showCommunes={filters.showCommunes}
            selectedProject={selectedProject}
            onSelectProject={setSelectedProject}
            hoveredProject={hoveredProject}
            onHoverProject={setHoveredProject}
            onViewProjectDetails={handleViewDetails}
            onMapFlyToReady={(flyToFn) => { mapFlyToRef.current = flyToFn; }}
          />

          <div className="hidden sm:block">
            <Sidebar
              projects={projects}
              filters={filters}
              onUpdateFilters={updateFilters}
              onToggleRegion={toggleRegion}
              onToggleType={(type) => toggleType(type as ProjectType)}
              onResetFilters={resetFilters}
              selectedProject={selectedProject}
              onSelectProject={handleSidebarProjectClick}
              hoveredProject={hoveredProject}
              onHoverProject={setHoveredProject}
              stats={stats}
            />
          </div>

          {mobileShowSidebar && (
            <div id="mobile-sidebar" className="sm:hidden">
              <Sidebar
                projects={projects}
                filters={filters}
                onUpdateFilters={updateFilters}
                onToggleRegion={toggleRegion}
                onToggleType={(type) => toggleType(type as ProjectType)}
                onResetFilters={resetFilters}
                selectedProject={selectedProject}
                onSelectProject={(project) => {
                  handleSidebarProjectClick(project);
                  setMobileShowSidebar(false);
                }}
                hoveredProject={hoveredProject}
                onHoverProject={setHoveredProject}
                stats={stats}
              />
            </div>
          )}

          <div className="absolute bottom-[max(1rem,env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 sm:hidden z-30">
            <button
              onClick={() => setMobileShowSidebar(!mobileShowSidebar)}
              aria-expanded={mobileShowSidebar}
              aria-controls="mobile-sidebar"
              className="bg-primary text-white rounded-full px-5 py-3 shadow-popup flex items-center gap-2 font-rubik font-semibold text-sm"
            >
              <Filter className="w-4 h-4" />
              {mobileShowSidebar ? 'Fermer' : 'Filtres & Liste'}
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
