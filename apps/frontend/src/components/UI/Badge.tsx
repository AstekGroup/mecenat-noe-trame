import { ProjectType, PROJECT_TYPE_LABELS, PROJECT_TYPE_COLORS } from '@/types/project';

interface BadgeProps {
  type: ProjectType;
  size?: 'sm' | 'md';
  variant?: 'default' | 'highlight';
}

export function Badge({ type, size = 'md', variant = 'default' }: BadgeProps) {
  const color = PROJECT_TYPE_COLORS[type] || '#cccccc';
  const label = PROJECT_TYPE_LABELS[type] || type;
  
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };
  
  // Style highlight : bleu marine sur fond jaune coquille d'oeuf
  if (variant === 'highlight') {
    return (
      <span
        className={`inline-flex items-center rounded-full font-semibold ${sizes[size]}`}
        style={{
          backgroundColor: '#ffeed0',
          color: '#003082',
        }}
      >
        {label}
      </span>
    );
  }
  
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizes[size]}`}
      style={{
        backgroundColor: `${color}15`,
        color: color,
      }}
    >
      {label}
    </span>
  );
}
