import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  status: string;
}

const initialTasks: Task[] = [
  { id: '1', title: 'Design Homepage', status: 'todo' },
  { id: '2', title: 'Create Mockups', status: 'todo' },
  { id: '3', title: 'Implement Authentication', status: 'in-progress' },
  { id: '4', title: 'Setup Database', status: 'in-progress' },
  { id: '5', title: 'Write Documentation', status: 'done' }
];

const columns = [
  { id: '1', title: 'To Do', status: 'todo', color: '#E5E7EB' },
  { id: '2', title: 'In Progress', status: 'in-progress', color: '#FDE68A' },
  { id: '3', title: 'Done', status: 'done', color: '#BBF7D0' }
];

export default function DemoKanban() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status } : task
    ));
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => (
            <div
              key={column.status}
              className="space-y-4"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.status)}
            >
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900">{column.title}</h2>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: column.color }}
                  />
                </div>
                <div className="space-y-3">
                  {tasks
                    .filter((task) => task.status === column.status)
                    .map((task) => (
                      <Card
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        className="cursor-move hover:shadow-md transition-shadow group"
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <h3 className="font-medium">{task.title}</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setTasks(tasks.filter(t => t.id !== task.id))}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}