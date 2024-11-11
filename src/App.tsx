import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import PrivateRoute from '@/components/PrivateRoute';
import NetworkStatus from '@/components/NetworkStatus';
import Navbar from '@/components/Navbar';
import Landing from '@/pages/Landing';
import Dashboard from '@/pages/Dashboard';
import ProjectKanban from '@/pages/ProjectKanban';
import Login from '@/pages/Login';
import Register from '@/pages/Register';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <div className="container mx-auto px-4 py-8">
                    <Dashboard />
                  </div>
                </PrivateRoute>
              } />
              <Route path="/project/:projectId" element={
                <PrivateRoute>
                  <ProjectKanban />
                </PrivateRoute>
              } />
            </Routes>
          </main>
          <NetworkStatus />
          <Toaster position="top-right" richColors />
        </div>
      </AuthProvider>
    </Router>
  );
}