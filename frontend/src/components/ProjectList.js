import React from 'react';
import ProjectCard from './ProjectCard';

const ProjectList = ({ projects, user, onDeleteProject, onTimerAction, isSearchActive = false }) => {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">
          {isSearchActive ? 'No projects match your search' : 'No projects found'}
        </div>
        {!isSearchActive && user?.role === 'ADMIN' && (
          <p className="text-gray-400 text-sm mt-2">
            Create your first project to get started
          </p>
        )}
        {isSearchActive && (
          <p className="text-gray-400 text-sm mt-2">
            Try adjusting your search terms or clear the search to see all projects
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {projects.map(project => (
        <ProjectCard
          key={project.id}
          project={project}
          user={user}
          onDelete={onDeleteProject}
          onTimerAction={onTimerAction}
        />
      ))}
    </div>
  );
};

export default ProjectList;
