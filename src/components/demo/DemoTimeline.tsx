import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths } from 'date-fns';

const mockProjects = [
  {
    id: '1',
    name: 'Website Redesign',
    startDate: new Date(2024, 0, 1),
    endDate: new Date(2024, 1, 15),
    color: '#3B82F6'
  },
  {
    id: '2',
    name: 'Mobile App Development',
    startDate: new Date(2024, 0, 15),
    endDate: new Date(2024, 2, 30),
    color: '#10B981'
  },
  {
    id: '3',
    name: 'Marketing Campaign',
    startDate: new Date(2024, 1, 1),
    endDate: new Date(2024, 2, 15),
    color: '#F59E0B'
  }
];

export default function DemoTimeline() {
  const [startDate] = useState(new Date(2024, 0, 1));
  const monthsToShow = 3;

  const getProjectPosition = (project: typeof mockProjects[0]) => {
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

  const months = Array.from({ length: monthsToShow }, (_, i) => addMonths(startDate, i));

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Project Timeline</CardTitle>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full">
          <div className="grid grid-cols-3 gap-px bg-gray-200">
            {months.map((month) => (
              <div
                key={month.getTime()}
                className="bg-white p-2 text-sm font-medium"
              >
                {format(month, 'MMMM yyyy')}
              </div>
            ))}
          </div>
          <div className="relative mt-4" style={{ height: '160px' }}>
            {mockProjects.map((project, index) => {
              const position = getProjectPosition(project);
              return (
                <div
                  key={project.id}
                  className="absolute h-8 rounded-full cursor-pointer transition-all duration-200 hover:brightness-110"
                  style={{
                    ...position,
                    top: `${index * 40}px`,
                    backgroundColor: project.color,
                  }}
                >
                  <div className="absolute inset-0 flex items-center px-4">
                    <span className="text-white text-sm font-medium truncate">
                      {project.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}