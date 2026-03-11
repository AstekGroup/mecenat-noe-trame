import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Project, PROJECT_TYPE_LABELS, PROJECT_TYPE_COLORS } from '@/types/project';
import { Pagination } from '@/components/UI/Pagination';
import { Users, MapPin } from 'lucide-react';

const ITEMS_PER_PAGE = 24;

interface ProjectListViewProps {
  projects: Project[];
}

export function ProjectListView({ projects }: ProjectListViewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  
  const totalPages = Math.ceil(projects.length / ITEMS_PER_PAGE);
  
  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return projects.slice(start, start + ITEMS_PER_PAGE);
  }, [projects, currentPage]);
  
  // Reset to page 1 when projects change
  useEffect(() => {
    setCurrentPage(1);
  }, [projects.length]);

  if (projects.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <MapPin className="w-16 h-16 text-text-secondary/30 mx-auto mb-4" />
          <p className="text-text-secondary text-lg font-medium">
            Aucun projet trouvé
          </p>
          <p className="text-text-secondary/70 text-sm mt-1">
            Essayez de modifier vos filtres
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Results count */}
      <div className="px-6 py-3 border-b border-primary/10 bg-white">
        <p className="text-sm text-text-secondary">
          {totalPages > 1 ? (
            <>
              Page {currentPage} sur {totalPages} — 
              <span className="font-semibold text-primary ml-1">{projects.length}</span> projets au total
            </>
          ) : (
            <>
              <span className="font-semibold text-primary">{projects.length}</span> projets trouvés
            </>
          )}
        </p>
      </div>

      {/* Project grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {paginatedProjects.map((project) => {
            const typeColor = PROJECT_TYPE_COLORS[project.type] || '#ccc';
            
            return (
              <Link
                key={project.id}
                to={`/projet/${project.id}`}
                className="bg-white rounded-xl shadow-card hover:shadow-popup transition-all group flex flex-col"
              >
                <div 
                  className="h-16 rounded-t-xl flex items-center justify-center relative"
                  style={{ backgroundColor: `${typeColor}10` }}
                >
                  <div className="absolute top-1.5 left-1.5 flex flex-wrap gap-1">
                    <span
                      className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                      style={{ backgroundColor: '#ffeed0', color: '#003082' }}
                    >
                      {PROJECT_TYPE_LABELS[project.type]}
                    </span>
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-3 flex-1 flex flex-col">
                  <h3 className="font-rubik font-semibold text-primary text-sm line-clamp-2 mb-2 group-hover:text-accent-magenta transition-colors">
                    {project.title}
                  </h3>
                  
                  <div className="space-y-1 text-xs text-text-secondary mt-auto">
                    <p className="flex items-center gap-1.5 text-accent-magenta font-medium truncate">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{project.city || project.region}</span>
                    </p>
                    
                    {project.owner && (
                      <p className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-accent-coral flex-shrink-0" />
                        <span className="truncate">{project.owner}</span>
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 border-t border-primary/10 bg-white">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
