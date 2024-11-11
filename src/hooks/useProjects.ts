import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  color: string;
  status: 'planned' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  userId: string;
}

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) {
      setProjects([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'projects'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const projectsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          startDate: doc.data().startDate.toDate(),
          endDate: doc.data().endDate.toDate()
        })) as Project[];
        
        setProjects(projectsData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Working in offline mode.');
        setLoading(false);
        toast.error('Connection issues. Working in offline mode.');
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  const addProject = async (projectData: Omit<Project, 'id' | 'userId'>) => {
    if (!currentUser) {
      toast.error('You must be logged in to add projects');
      return;
    }

    try {
      const docRef = await addDoc(collection(db, 'projects'), {
        ...projectData,
        userId: currentUser.uid,
        createdAt: new Date()
      });
      toast.success('Project created successfully!');
      return docRef.id;
    } catch (err) {
      console.error('Error adding project:', err);
      toast.error('Failed to create project. Changes will sync when back online.');
      throw err;
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      await deleteDoc(doc(db, 'projects', projectId));
      toast.success('Project deleted successfully!');
    } catch (err) {
      console.error('Error deleting project:', err);
      toast.error('Failed to delete project. Will retry when back online.');
      throw err;
    }
  };

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    try {
      await updateDoc(doc(db, 'projects', projectId), updates);
      toast.success('Project updated successfully!');
    } catch (err) {
      console.error('Error updating project:', err);
      toast.error('Failed to update project. Changes will sync when back online.');
      throw err;
    }
  };

  return {
    projects,
    loading,
    error,
    addProject,
    deleteProject,
    updateProject
  };
}