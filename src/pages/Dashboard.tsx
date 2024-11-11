import { useState, useEffect } from 'react';
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import ProjectTimeline from '@/components/ProjectTimeline';
import ColorLegend from '@/components/ColorLegend';
import { Button } from '@/components/ui/button';
import { Plus, Check, ExternalLink, Sparkles, MessageSquarePlus, MousePointerClick } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { differenceInDays } from 'date-fns';

interface Project {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  color: string;
  priority: 'low' | 'medium' | 'high';
  status: 'planned' | 'in-progress' | 'completed';
  userId: string;
}

const initialProjectState = {
  name: '',
  description: '',
  startDate: new Date(),
  endDate: new Date(Date.now() + 86400000),
  color: '#000000',
  priority: 'medium' as const,
  status: 'planned' as const
};

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProject, setNewProject] = useState(initialProjectState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'projects'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projectData: Project[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        projectData.push({
          id: doc.id,
          name: data.name,
          description: data.description,
          startDate: data.startDate.toDate(),
          endDate: data.endDate.toDate(),
          color: data.color,
          priority: data.priority,
          status: data.status,
          userId: data.userId,
        });
      });
      setProjects(projectData);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const validateProject = () => {
    if (!newProject.name.trim()) {
      setValidationError('Project name is required');
      return false;
    }

    const startDate = new Date(newProject.startDate);
    const endDate = new Date(newProject.endDate);
    
    if (startDate >= endDate) {
      setValidationError('End date must be after start date');
      return false;
    }

    const duration = differenceInDays(endDate, startDate);
    if (duration < 1) {
      setValidationError('Project must be at least 1 day long');
      return false;
    }

    setValidationError(null);
    return true;
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || isSubmitting) return;

    if (!validateProject()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'projects'), {
        ...newProject,
        userId: currentUser.uid,
        startDate: new Date(newProject.startDate),
        endDate: new Date(newProject.endDate),
      });

      toast.success('Project created successfully!', {
        description: `"${newProject.name}" has been added to your timeline.`,
      });

      setNewProject(initialProjectState);
      setDialogOpen(false);
    } catch (error) {
      toast.error('Failed to create project', {
        description: 'Please try again later.',
      });
      console.error('Error adding project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!currentUser) return;
    try {
      await deleteDoc(doc(db, 'projects', projectId));
      toast.success('Project deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete project');
      console.error('Error deleting project:', error);
    }
  };

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setNewProject(initialProjectState);
      setIsSubmitting(false);
      setValidationError(null);
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 -mx-4 -mt-8 px-4 py-6 shadow-lg">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/10 rounded-full p-2">
                <MessageSquarePlus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">Help Shape ProjectHub's Future!</h2>
                <p className="text-blue-100">Your ideas can make this tool even better</p>
              </div>
            </div>
            <a
              href="https://theprojecthub.cnflx.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-white text-blue-600 rounded-full font-medium hover:bg-blue-50 transition-colors"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Submit Feature Request
              <ExternalLink className="h-4 w-4 ml-2" />
            </a>
          </div>
        </div>
      </div>

      <div className="container mx-auto">
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">Projects Dashboard</h1>
            <ColorLegend onColorSelect={(color) => setNewProject({ ...newProject, color })} />
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-center space-x-3">
            <MousePointerClick className="h-5 w-5 text-blue-500 flex-shrink-0" />
            <p className="text-sm text-blue-700">
              Click on any project in the timeline to view its Kanban board and manage tasks
            </p>
          </div>

          <ProjectTimeline 
            initialProjects={projects} 
            onDeleteProject={handleDeleteProject}
            onAddProject={() => setDialogOpen(true)}
          />
        </div>

        <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogContent className="sm:max-w-[500px] bg-white">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddProject} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="project-name">Project Name</Label>
                  <Input
                    id="project-name"
                    value={newProject.name}
                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                    className="mt-1.5"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newProject.description}
                    onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                    className="mt-1.5"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={newProject.startDate.toISOString().split('T')[0]}
                      onChange={(e) => {
                        const newStartDate = new Date(e.target.value);
                        setNewProject({ 
                          ...newProject, 
                          startDate: newStartDate,
                          endDate: new Date(Math.max(
                            newProject.endDate.getTime(),
                            newStartDate.getTime() + 86400000
                          ))
                        });
                      }}
                      className="mt-1.5"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={newProject.endDate.toISOString().split('T')[0]}
                      min={new Date(newProject.startDate.getTime() + 86400000).toISOString().split('T')[0]}
                      onChange={(e) => setNewProject({ ...newProject, endDate: new Date(e.target.value) })}
                      className="mt-1.5"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Input
                        type="color"
                        value={newProject.color}
                        onChange={(e) => setNewProject({ ...newProject, color: e.target.value })}
                        className="h-10 w-full"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <select
                      id="priority"
                      value={newProject.priority}
                      onChange={(e) => setNewProject({ ...newProject, priority: e.target.value as 'low' | 'medium' | 'high' })}
                      className="mt-1.5 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <select
                      id="status"
                      value={newProject.status}
                      onChange={(e) => setNewProject({ ...newProject, status: e.target.value as 'planned' | 'in-progress' | 'completed' })}
                      className="mt-1.5 w-full rounded-md border border-input bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="planned">Planned</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
                {validationError && (
                  <p className="text-sm text-red-600">{validationError}</p>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => handleDialogOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Project'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}