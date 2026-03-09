import { memo } from 'react';
import { Project, PROJECT_TYPE_LABELS, PROJECT_TYPE_COLORS } from '@/types/project';
import { TYPE_ICONS } from '@/components/Map/ProjectMarker';
import { Calendar, MapPin } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function ProjectCardComponent({
  project,
  isSelected,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: ProjectCardProps) {
  const formattedDate = project.startDate ? new Date(project.startDate).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  }) : null;

  const Icon = TYPE_ICONS[project.type];
  const color = PROJECT_TYPE_COLORS[project.type] || '#ccc';

  return (
    <div
      className={`p-4 rounded-card bg-white border-2 cursor-pointer card-hover transition-all duration-200 ${
        isSelected
          ? 'border-accent-coral shadow-popup'
          : isHovered
          ? 'border-primary/30 shadow-card'
          : 'border-transparent shadow-card hover:border-primary/20'
      }`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: color }}
        >
          {Icon && <Icon className="w-4 h-4 text-white" />}
        </div>

        <div className="flex-1 min-w-0">
          <span
            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold mb-1"
            style={{ backgroundColor: '#ffeed0', color: '#003082' }}
          >
            {Icon && <Icon className="w-2.5 h-2.5" />}
            {PROJECT_TYPE_LABELS[project.type]}
          </span>

          <h4 className="font-rubik font-semibold text-text-primary text-sm leading-tight line-clamp-2">
            {project.title}
          </h4>

          <div className="mt-2 space-y-1">
            {formattedDate && (
              <div className="flex items-center gap-3 text-xs text-text-secondary">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-accent-coral" />
                  {formattedDate}
                </span>
              </div>
            )}

            <div className="flex items-center gap-1 text-xs text-text-secondary">
              <MapPin className="w-3.5 h-3.5 text-accent-coral flex-shrink-0" />
              <span className="truncate">{project.city}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const ProjectCard = memo(ProjectCardComponent);
