import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Mail, Globe } from 'lucide-react';
import { useProjects } from '@/hooks';
import { 
  PROJECT_TYPE_LABELS, 
} from '@/types/project';
import { Loader2 } from 'lucide-react';

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { allProjects, loading, error } = useProjects();
  
  const project = allProjects.find(p => p.id === id);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-beige flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-accent-coral mx-auto animate-spin" />
          <p className="mt-4 font-rubik font-semibold text-primary text-lg">
            Chargement du projet...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface-beige flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <p className="text-text-secondary mb-6">{error.message}</p>
          <button onClick={() => window.location.reload()} className="btn-primary">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-surface-beige flex items-center justify-center">
        <div className="text-center max-w-md p-8">
          <h2 className="font-rubik font-semibold text-primary text-xl mb-4">
            Projet non trouvé
          </h2>
          <p className="text-text-secondary mb-6">
            Le projet que vous recherchez n'existe pas ou a été supprimé.
          </p>
          <button onClick={() => navigate(-1)} className="btn-primary">
            Retour
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-beige overflow-y-auto">
      {/* Hero Header */}
      <div className="bg-primary py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-popup overflow-hidden">
          {/* Header */}
          <div className="p-6 md:p-8 border-b border-primary/10">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold"
                style={{ backgroundColor: '#ffeed0', color: '#003082' }}
              >
                {PROJECT_TYPE_LABELS[project.type]}
              </span>
              {project.isOngoing && (
                <span className="inline-flex items-center gap-1.5 bg-accent-coral/10 text-accent-coral px-3 py-1.5 rounded-full text-sm font-medium">
                  En cours
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="font-rubik text-2xl md:text-3xl font-bold text-primary mb-2">
              {project.title}
            </h1>

            {/* Owner & Profile */}
            <div className="space-y-1">
              {project.owner && (
                <p className="text-text-secondary">
                  Porté par <span className="font-medium text-primary">{project.owner}</span>
                </p>
              )}
              {project.ownerProfile && (
                <p className="text-sm text-text-secondary italic">
                  Profil : {project.ownerProfile}
                </p>
              )}
            </div>
            
            {/* Habitat Types (as tags) */}
            {project.habitatType && (
              <div className="mt-4 flex flex-wrap gap-2">
                {(Array.isArray(project.habitatType) ? project.habitatType : [project.habitatType]).map(habitat => (
                  <span key={habitat} className="px-2 py-1 bg-accent-coral/10 text-accent-coral text-xs font-medium rounded-md">
                    {habitat}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Details & Location side by side */}
          <div className="p-6 md:p-8 border-b border-primary/10 bg-surface-beige/30">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Info (Extent etc) */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent-coral/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-accent-coral" />
                </div>
                <div>
                  <h3 className="font-rubik font-semibold text-sm text-primary/70 uppercase tracking-wide mb-1">
                    Informations
                  </h3>
                  {project.extent && (
                    <p className="text-text-secondary font-medium">Emprise : {project.extent}</p>
                  )}
                  {project.isOngoing && (
                    <p className="text-text-secondary">Projet en cours de réalisation</p>
                  )}
                  {!project.extent && !project.isOngoing && (
                    <p className="text-text-secondary italic text-sm">Aucune information additionnelle</p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-accent-coral/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-accent-coral" />
                </div>
                <div>
                  <h3 className="font-rubik font-semibold text-sm text-primary/70 uppercase tracking-wide mb-1">
                    Localisation
                  </h3>
                  {project.address && (
                    <p className="text-text-secondary">{project.address}</p>
                  )}
                  <p className="text-text-secondary font-medium">
                    {project.postalCode} {project.city}
                  </p>
                  <p className="text-text-secondary text-sm">{project.department} - {project.region}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-6 md:p-8 border-b border-primary/10">
            <h2 className="font-rubik font-semibold text-lg text-primary mb-3">
              Description
            </h2>
            <p className="text-text-secondary whitespace-pre-line">
              {project.description}
            </p>
          </div>

          {/* Contact */}
          <div className="p-6 md:p-8 border-b border-primary/10">
            <h2 className="font-rubik font-semibold text-lg text-primary mb-4">
              Contact & Liens
            </h2>
            <div className="space-y-3">
              {project.contactEmail && (
                <a
                  href={`mailto:${project.contactEmail}`}
                  className="flex items-center gap-3 text-text-secondary hover:text-primary transition-colors"
                >
                  <Mail className="w-5 h-5 text-accent-coral" />
                  {project.contactEmail}
                </a>
              )}
              {project.website && (
                <a
                  href={project.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-text-secondary hover:text-primary transition-colors"
                >
                  <Globe className="w-5 h-5 text-accent-coral" />
                  Site web du projet
                </a>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Spacer */}
      <div className="h-12" />
    </div>
  );
}
