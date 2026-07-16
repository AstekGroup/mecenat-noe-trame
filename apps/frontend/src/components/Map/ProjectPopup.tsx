import { Project, PROJECT_TYPE_LABELS } from '@/types/project';
import { MapPin, User, Mail, Eye, Phone } from 'lucide-react';
import { TYPE_ICONS } from './ProjectMarker';

interface ProjectPopupProps {
  project: Project;
  onClose: () => void;
  onViewDetails?: (projectId: string) => void;
}

export function ProjectPopup({ project, onClose, onViewDetails }: ProjectPopupProps) {
  const Icon = TYPE_ICONS[project.type];

  return (
    <div className="bg-white rounded-card shadow-popup w-80 max-w-[90vw] animate-fade-in overflow-hidden">
      {/* Header */}
      <div className="bg-primary p-4 text-white">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-semibold" style={{ backgroundColor: '#ffeed0', color: '#003082' }}>
                <Icon className="w-3 h-3" />
                {PROJECT_TYPE_LABELS[project.type]}
              </span>
            </div>
            <h3 className="font-rubik font-semibold text-base mt-2 leading-tight">
              {project.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 -mr-1 -mt-1 transition-colors"
            aria-label="Fermer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4 space-y-2.5">
        {/* Lieu */}
        <div className="flex items-start gap-2 text-sm">
          <MapPin className="w-4 h-4 text-accent-coral mt-0.5 flex-shrink-0" />
          <div className="text-text-secondary">
            <p>{project.address}</p>
            <p className="font-medium text-text-primary">{project.postalCode} {project.city}</p>
          </div>
        </div>
        
        {/* Organisateur */}
        {project.owner && (
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-accent-coral" />
            <span className="text-text-secondary">{project.owner}</span>
          </div>
        )}

        {project.contactPhone && (
          <a
            href={`tel:${project.contactPhone}`}
            className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors"
          >
            <Phone className="w-4 h-4 text-accent-coral" />
            {project.contactPhone}
          </a>
        )}

        {/* Informations spécifiques au type */}
        {project.type === 'pratiques-raisonnees' && project.reasonedPracticeTypes?.length && (
          <div className="text-xs bg-primary/5 p-2 rounded border border-primary/10">
            <p className="font-semibold text-primary mb-1">Pratiques :</p>
            <p className="text-text-secondary">{project.reasonedPracticeTypes.join(', ')}</p>
          </div>
        )}
        {project.type === 'renaturation-restauration' && project.renaturationTypes?.length && (
          <div className="text-xs bg-primary/5 p-2 rounded border border-primary/10">
            <p className="font-semibold text-primary mb-1">Actions :</p>
            <p className="text-text-secondary">{project.renaturationTypes.join(', ')}</p>
          </div>
        )}
        {project.type === 'sensibilisation' && project.sensitizationTitle && (
          <div className="text-xs bg-primary/5 p-2 rounded border border-primary/10">
            <p className="font-semibold text-primary mb-1">Titre :</p>
            <p className="text-text-secondary">{project.sensitizationTitle}</p>
          </div>
        )}
        {project.type === 'formation' && project.trainingTitle && (
          <div className="text-xs bg-primary/5 p-2 rounded border border-primary/10">
            <p className="font-semibold text-primary mb-1">Titre :</p>
            <p className="text-text-secondary">{project.trainingTitle}</p>
          </div>
        )}
        {project.type === 'consultation' && project.consultationType && (
          <div className="text-xs bg-primary/5 p-2 rounded border border-primary/10">
            <p className="font-semibold text-primary mb-1">Type de consultation :</p>
            <p className="text-text-secondary">{project.consultationType}</p>
          </div>
        )}
        {project.type === 'suivis' && (project.followUpType || project.followUpFrequency) && (
          <div className="text-xs bg-primary/5 p-2 rounded border border-primary/10">
            {project.followUpType && (
              <p className="text-text-secondary"><span className="font-semibold text-primary">Type :</span> {project.followUpType}</p>
            )}
            {project.followUpFrequency && (
              <p className="text-text-secondary mt-1"><span className="font-semibold text-primary">Fréquence :</span> {project.followUpFrequency}</p>
            )}
          </div>
        )}
        
        {/* Description */}
        {project.description && (
          <p className="text-sm text-text-secondary line-clamp-2">
            {project.description}
          </p>
        )}
        
        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => onViewDetails?.(project.id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 bg-surface-beige hover:bg-surface-beige/80 text-primary font-medium rounded-lg text-sm transition-colors"
          >
            <Eye className="w-4 h-4" />
            Voir les détails
          </button>
          
          {project.contactEmail && (
            <a
              href={`mailto:${project.contactEmail}`}
              className="flex items-center justify-center gap-1.5 py-2 px-3 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-lg text-sm transition-colors"
              title="Contacter"
            >
              <Mail className="w-4 h-4" />
              Contact
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
