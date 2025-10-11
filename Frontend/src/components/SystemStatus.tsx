import { CheckCircle } from 'lucide-react';

export const SystemStatus = () => {
  return (
    <div className="flex items-center space-x-2 px-3 py-1 bg-success/10 text-success rounded-full text-sm">
      <CheckCircle className="h-3 w-3" />
      <span className="font-medium">All systems operational</span>
    </div>
  );
};