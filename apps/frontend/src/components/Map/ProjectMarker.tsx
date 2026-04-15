import { memo } from 'react';
import { Leaf, Sprout, Wrench, Megaphone, BookOpen, Users, Eye } from 'lucide-react';
import { ProjectType, PROJECT_TYPE_COLORS } from '@/types/project';

interface ProjectMarkerProps {
  type: ProjectType;
  isSelected?: boolean;
  onClick: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  size?: 'sm' | 'md';
}

export const TYPE_ICONS: Record<ProjectType, typeof Leaf> = {
  'pratiques-raisonnees': Leaf,
  'renaturation-restauration': Sprout,
  'sensibilisation': Megaphone,
  'formation': BookOpen,
  'consultation': Users,
  'suivis': Eye,
};

function ProjectMarkerComponent({
  type,
  isSelected = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  size = 'md',
}: ProjectMarkerProps) {
  const Icon = TYPE_ICONS[type];
  const color = PROJECT_TYPE_COLORS[type] || '#cccccc';
  const isSmall = size === 'sm';
  
  return (
    <div
      className={`event-marker animate-scale-in ${isSelected ? 'ring-2 ring-white scale-125' : ''}`}
      style={{
        backgroundColor: color,
        width: isSmall ? '16px' : '32px',
        height: isSmall ? '16px' : '32px',
      }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-label="Voir les détails du projet"
    >
      <Icon className={isSmall ? 'w-2 h-2 text-white' : 'w-4 h-4 text-white'} />
    </div>
  );
}

export const ProjectMarker = memo(ProjectMarkerComponent);
