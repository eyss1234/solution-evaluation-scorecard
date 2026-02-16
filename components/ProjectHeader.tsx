'use client';

import { EditProjectName } from './EditProjectName';

interface ProjectHeaderProps {
  projectId: string;
  projectName: string;
}

export function ProjectHeader({ projectId, projectName }: ProjectHeaderProps) {
  return (
    <EditProjectName 
      projectId={projectId} 
      currentName={projectName}
    />
  );
}
