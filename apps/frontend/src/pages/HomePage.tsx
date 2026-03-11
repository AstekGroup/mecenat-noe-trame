import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Globe, ArrowRight, Users } from 'lucide-react';
import { useProjects } from '@/hooks';
import { Project, PROJECT_TYPE_COLORS } from '@/types/project';
import { TYPE_ICONS } from '@/components/Map/ProjectMarker';
import { Loader2 } from 'lucide-react';

function MiniProjectCard({ project }: { project: Project }) {
  const Icon = TYPE_ICONS[project.type];
  const typeColor = PROJECT_TYPE_COLORS[project.type];

  return (
    <Link
      to={`/projet/${project.id}`}
      className="bg-white rounded-xl shadow-card hover:shadow-popup transition-all group overflow-hidden flex flex-col h-full"
    >
      <div className="h-16 flex items-center justify-center relative flex-shrink-0" style={{ backgroundColor: `${typeColor}10` }}>
        {Icon && <Icon className="w-6 h-6" style={{ color: typeColor }} />}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <h3 className="font-rubik font-semibold text-primary text-sm line-clamp-2 mb-1.5 group-hover:text-accent-magenta transition-colors">
          {project.title}
        </h3>
        <div className="space-y-1 text-xs text-text-secondary mt-auto">
          <p className="flex items-center gap-1.5 text-accent-magenta font-medium truncate">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span>{project.city || project.region}</span>
          </p>
          {project.owner && (
            <p className="flex items-center gap-1.5">
              <Users className="w-3 h-3 text-accent-coral flex-shrink-0" />
              <span className="truncate">{project.owner}</span>
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

export function HomePage() {
  const { allProjects, loading } = useProjects();

  const recentProjects = useMemo(() =>
    allProjects
      .slice(0, 6),
    [allProjects]
  );

  return (
    <div className="min-h-screen bg-surface-beige overflow-y-auto flex flex-col">
      {/* Hero Section */}
      <div className="bg-primary text-white py-16 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="font-rubik text-4xl md:text-5xl font-bold mb-4">
            Trame pollinisateur
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-2 flex items-center justify-center gap-2">
            <Globe className="w-6 h-6 text-accent-coral" />
            Carte des initiatives pour la biodiversité
          </p>
          <p className="text-lg text-white/70 max-w-2xl mx-auto mt-4">
            Découvrez les projets de renaturation, restauration, et sensibilisation
            en faveur des pollinisateurs sur tout le territoire français.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-16 flex-1 w-full">

        <section>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent-coral/10 rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-accent-coral" />
              </div>
              <div>
                <h2 className="font-rubik font-bold text-xl text-primary">Derniers projets</h2>
                <p className="text-text-secondary text-sm">Récemment ajoutés</p>
              </div>
            </div>
            <Link
              to="/projets"
              className="btn-primary inline-flex items-center gap-2 text-sm"
            >
              Voir tous les projets
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 text-accent-coral animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {recentProjects.map(project => (
                <MiniProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </section>

        {/* Info Section */}
        <div className="bg-primary/5 rounded-2xl p-8 text-center mt-auto">
          <h3 className="font-rubik font-semibold text-xl text-primary mb-3">
            Pourquoi cette plateforme ?
          </h3>
          <p className="text-text-secondary max-w-3xl mx-auto">
            Nous avons créé cette plateforme pour centraliser et rendre accessibles
            tous les projets de renaturation et de protection de la biodiversité. 
          </p>
        </div>
      </div>
    </div>
  );
}
