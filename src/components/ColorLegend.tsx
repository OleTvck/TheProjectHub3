import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Plus, X, HelpCircle } from 'lucide-react';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { toast } from 'sonner';

interface ColorEntry {
  id: string;
  color: string;
  label: string;
  userId: string;
}

interface ColorLegendProps {
  onColorSelect?: (color: string) => void;
}

function ColorLegend({ onColorSelect }: ColorLegendProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [entries, setEntries] = useState<ColorEntry[]>([]);
  const [newEntry, setNewEntry] = useState({ color: '#000000', label: '' });
  const { currentUser } = useAuth();

  useEffect(() => {
    if (!currentUser) return;

    const q = query(
      collection(db, 'colorLegends'),
      where('userId', '==', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const colorEntries: ColorEntry[] = [];
      snapshot.forEach((doc) => {
        colorEntries.push({ id: doc.id, ...doc.data() } as ColorEntry);
      });
      setEntries(colorEntries);
    }, (error) => {
      console.error('Error fetching color legends:', error);
      toast.error('Failed to load color legends');
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleAddEntry = async () => {
    if (!currentUser) return;
    if (!newEntry.label.trim()) return;

    try {
      await addDoc(collection(db, 'colorLegends'), {
        color: newEntry.color,
        label: newEntry.label.trim(),
        userId: currentUser.uid,
        createdAt: new Date()
      });

      setNewEntry({ color: '#000000', label: '' });
      setIsAdding(false);
      toast.success('Color added successfully');
    } catch (error) {
      console.error('Error adding color:', error);
      toast.error('Failed to add color');
    }
  };

  const handleRemoveEntry = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'colorLegends', id));
      toast.success('Color removed successfully');
    } catch (error) {
      console.error('Error removing color:', error);
      toast.error('Failed to remove color');
    }
  };

  return (
    <Card className="p-4 space-y-4 color-legend">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium">Color Legend</h3>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="h-4 w-4 text-gray-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-2">
                  <p>Your custom color scheme for projects.</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    <li>Click any color to use it in a new project</li>
                    <li>Hover over entries to reveal delete option</li>
                    <li>Colors are saved to your account</li>
                  </ul>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Color</span>
        </Button>
      </div>

      <div className="space-y-2">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between group"
          >
            <div
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => onColorSelect?.(entry.color)}
            >
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm">{entry.label}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleRemoveEntry(entry.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        {isAdding && (
          <div className="space-y-2 pt-2 border-t">
            <div className="space-y-1.5">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                type="color"
                value={newEntry.color}
                onChange={(e) => setNewEntry({ ...newEntry, color: e.target.value })}
                className="h-8 w-full"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={newEntry.label}
                onChange={(e) => setNewEntry({ ...newEntry, label: e.target.value })}
                placeholder="e.g., High Priority Projects"
              />
            </div>
            <div className="flex space-x-2">
              <Button size="sm" onClick={handleAddEntry}>
                Add
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsAdding(false);
                  setNewEntry({ color: '#000000', label: '' });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export default ColorLegend;