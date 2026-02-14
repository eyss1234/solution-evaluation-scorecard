'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from './Card';
import { Button } from './Button';
import { formatDate } from '@/lib/format';

interface Project {
  id: string;
  name: string;
  createdAt: Date;
  gatingRuns: Array<{
    id: string;
    answers: Array<{ value: boolean }>;
  }>;
  scorecardRuns: Array<{
    id: string;
  }>;
}

interface ProjectListProps {
  projects: Project[];
}

export function ProjectList({ projects }: ProjectListProps) {
  const router = useRouter();
  const [projectName, setProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!projectName.trim()) {
      setError('Project name is required');
      return;
    }

    setIsCreating(true);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: projectName }),
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error(data.error?.message || 'Failed to create project');
      }

      setProjectName('');
      router.push(`/project/${data.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsCreating(false);
    }
  };

  const getGatingStatus = (project: Project) => {
    if (project.gatingRuns.length === 0) return 'not_started';
    const latestRun = project.gatingRuns[0];
    const hasYes = latestRun.answers.some((a) => a.value === true);
    return hasYes ? 'passed' : 'failed';
  };

  return (
    <div className="space-y-6">
      {/* Create Project Form */}
      <Card>
        <form onSubmit={handleCreateProject} className="space-y-4">
          <div>
            <label htmlFor="projectName" className="block text-sm font-medium text-zinc-700 mb-2">
              Create New Project
            </label>
            <input
              type="text"
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Enter project name..."
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
              disabled={isCreating}
            />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}
          <Button type="submit" disabled={isCreating} className="w-full">
            {isCreating ? 'Creating...' : 'Create Project'}
          </Button>
        </form>
      </Card>

      {/* Projects List */}
      {projects.length === 0 ? (
        <Card className="text-center py-12">
          <div className="text-zinc-400 mb-2">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-zinc-700 mb-2">No projects yet</h3>
          <p className="text-zinc-500">Create your first project to get started</p>
        </Card>
      ) : (
        <div className="space-y-8">
          <h2 className="text-xl font-semibold text-zinc-900">Your Projects</h2>
          {projects.map((project) => {
            const gatingStatus = getGatingStatus(project);
            return (
              <Link key={project.id} href={`/project/${project.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer mb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-zinc-900 mb-1">{project.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-zinc-500">
                        <span>Created {formatDate(project.createdAt)}</span>
                        <span>•</span>
                        <span>{project.scorecardRuns.length} scorecard{project.scorecardRuns.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {gatingStatus === 'not_started' && (
                        <span className="px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 text-sm font-medium">
                          Not Started
                        </span>
                      )}
                      {gatingStatus === 'passed' && (
                        <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-medium">
                          Gate Passed
                        </span>
                      )}
                      {gatingStatus === 'failed' && (
                        <span className="px-3 py-1 rounded-full bg-red-50 text-red-600 text-sm font-medium">
                          Gate Failed
                        </span>
                      )}
                      <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
