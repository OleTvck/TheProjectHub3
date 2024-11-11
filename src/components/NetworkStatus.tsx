import { useAuth } from '@/contexts/AuthContext';
import { Wifi, WifiOff } from 'lucide-react';

export default function NetworkStatus() {
  const { isOnline } = useAuth();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full flex items-center space-x-2">
      <WifiOff className="h-4 w-4" />
      <span>Offline</span>
    </div>
  );
}