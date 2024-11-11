import { Link } from 'react-router-dom';
import { LayoutDashboard, Clock, Users, Zap, Calendar, Palette, Wifi, Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import DemoTimeline from '@/components/demo/DemoTimeline';
import DemoKanban from '@/components/demo/DemoKanban';

export default function Landing() {
  const { currentUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-gray-100/50 bg-[size:20px_20px] [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="container mx-auto px-4 py-24 relative">
          <div className="text-center max-w-3xl mx-auto space-y-8">
            <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Project Timeline Management Made Simple
            </h1>
            <p className="text-xl text-gray-600">
              Visualize your projects, track progress, and collaborate with your team in one beautiful timeline interface.
            </p>
            <div className="flex items-center justify-center gap-4">
              {currentUser ? (
                <>
                  <Link to="/dashboard">
                    <Button size="lg" className="font-medium">
                      <LayoutDashboard className="h-5 w-5 mr-2" />
                      Go to Dashboard
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" onClick={handleLogout}>
                    <LogOut className="h-5 w-5 mr-2" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" className="font-medium">
                      Get Started Free
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" size="lg">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-24">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<LayoutDashboard className="h-6 w-6" />}
            title="Visual Timeline"
            description="Intuitive timeline view for all your projects. Track progress and milestones at a glance."
          />
          <FeatureCard
            icon={<Clock className="h-6 w-6" />}
            title="Real-time Updates"
            description="Changes sync instantly across all devices. Stay up-to-date with your team's progress."
          />
          <FeatureCard
            icon={<Palette className="h-6 w-6" />}
            title="Custom Color Schemes"
            description="Create and save color legends for different project types and priorities."
          />
        </div>
      </div>

      {/* Demo Section */}
      <div className="bg-gray-50 py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">See it in Action</h2>
              <p className="text-gray-600">Try our interactive section below to experience the power of visual project management</p>
            </div>
            
            <div className="space-y-12">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Timeline View</h3>
                <p className="text-gray-600">Visualize project timelines and track progress effortlessly</p>
                <div className="bg-white rounded-xl overflow-hidden border shadow-lg p-6">
                  <DemoTimeline />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold">Kanban Board</h3>
                <p className="text-gray-600">Drag and drop tasks between columns to manage workflow (try it!)</p>
                <div className="bg-white rounded-xl overflow-hidden border shadow-lg">
                  <DemoKanban />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
          <p className="text-xl text-gray-600">
            Join thousands of teams already managing their projects more effectively.
          </p>
          <div className="flex items-center justify-center gap-4">
            {currentUser ? (
              <Link to="/dashboard">
                <Button size="lg" className="font-medium">
                  <LayoutDashboard className="h-5 w-5 mr-2" />
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" className="font-medium">
                    Start Free Trial
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" size="lg">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-6 w-6" />
              <span className="font-bold text-xl">ProjectHub</span>
            </div>
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} ProjectHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="relative group">
      <div className="absolute -inset-px bg-gradient-to-r from-gray-100 to-gray-50 rounded-xl group-hover:from-gray-200 group-hover:to-gray-100 transition-all duration-300" />
      <div className="relative bg-white p-8 rounded-xl border space-y-4">
        <div className="inline-block p-3 rounded-lg bg-gray-50 text-gray-800">
          {icon}
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}