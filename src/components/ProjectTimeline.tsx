import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { ChevronLeft, ChevronRight, Trash2, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { format, addMonths, startOfDay } from 'date-fns';

interface Project {
  id: string;
  name: string;
  description?: string;
  startDate: Date;
  endDate: Date;
  color: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'planned' | 'in-progress' | 'completed';
}

interface ProjectTimelineProps {
  initialProjects?: Project[];
  onDeleteProject?: (projectId: string) => void;
  onAddProject?: () => void;
}

export default function ProjectTimeline({ initialProjects = [], onDeleteProject, onAddProject }: ProjectTimelineProps) {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [hoveredProject, setHoveredProject] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const monthsToShow = 6;

  useEffect(() => {
    setProjects(initialProjects);
  }, [initialProjects]);

  const handleProjectClick = (projectId: string) => {
    navigate(`/project/${projectId}`);
  };

  const getProjectPosition = (project: Project) => {
    const timelineStart = startDate.getTime();
    const timelineEnd = addMonths(startDate, monthsToShow).getTime();
    const duration = timelineEnd - timelineStart;

    const projectStart = Math.max(project.startDate.getTime(), timelineStart);
    const projectEnd = Math.min(project.endDate.getTime(), timelineEnd);

    const left = ((projectStart - timelineStart) / duration) * 100;
    const width = ((projectEnd - projectStart) / duration) * 100;

    return {
      left: `${left}%`,
      width: `${Math.max(width, 2)}%`
    };
  };

  const handlePreviousMonth = () => {
    setStartDate(prev => addMonths(prev, -1));
  };

  const handleNextMonth = () => {
    setStartDate(prev => addMonths(prev, 1));
  };

  const months = Array.from({ length: monthsToShow }, (_, i) => addMonths(startDate, i));

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Project Timeline</CardTitle>
        <div className="flex items-center space-x-4">
          {onAddProject && (
            <Button onClick={onAddProject} className="timeline-add-project">
              <Plus className="h-4 w-4 mr-2" />
              Add Project
            </Button>
          )}
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="w-full" type="always">
          <div className="w-full min-w-[800px]">
            <div className="grid grid-cols-6 gap-px bg-gray-200">
              {months.map((month) => (
                <div
                  key={month.getTime()}
                  className="bg-white p-2 text-sm font-medium"
                >
                  {format(month, 'MMMM yyyy')}
                </div>
              ))}
            </div>
            <div className="relative mt-4" style={{ height: `${Math.max(projects.length * 40 + 20, 200)}px` }}>
              <div
                className="absolute top-0 bottom-0 w-px bg-blue-500"
                style={{
                  left: `${((new Date().getTime() - startDate.getTime()) /
                    (addMonths(startDate, monthsToShow).getTime() - startDate.getTime())) *
                    100}%`,
                }}
              />
              {projects.map((project, index) => {
                const position = getProjectPosition(project);
                return (
                  <TooltipProvider key={project.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className="absolute h-8 rounded-full cursor-pointer transition-all duration-200 group timeline-project"
                          style={{
                            ...position,
                            top: `${index * 40}px`,
                            backgroundColor: project.color,
                            opacity: hoveredProject === project.id || hoveredProject === null ? 1 : 0.5,
                          }}
                          onClick={() => handleProjectClick(project.id)}
                          onMouseEnter={() => setHoveredProject(project.id)}
                          onMouseLeave={() => setHoveredProject(null)}
                        >
                          <div className="absolute inset-0 flex items-center px-4">
                            <span className="text-white text-sm font-medium truncate">
                              {project.name}
                            </span>
                          </div>
                          {onDeleteProject && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeleteProject(project.id);
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-2">
                          <p className="font-medium">{project.name}</p>
                          {project.description && (
                            <p className="text-sm text-gray-500">{project.description}</p>
                          )}
                          <div className="text-xs text-gray-500">
                            {format(project.startDate, 'MMM d, yyyy')} -{' '}
                            {format(project.endDate, 'MMM d, yyyy')}
                          </div>
                          {project.priority && (
                            <div className="text-xs">
                              Priority: <span className="font-medium capitalize">{project.priority}</span>
                            </div>
                          )}
                          {project.status && (
                            <div className="text-xs">
                              Status: <span className="font-medium capitalize">{project.status}</span>
                            </div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </CardContent>
    </Card>
  );
}