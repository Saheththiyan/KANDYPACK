import { BrandPane } from '@/components/BrandPane';
import { AuthCard } from '@/components/AuthCard';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { SystemStatus } from '@/components/SystemStatus';
import loginBackground from '@/assets/login-background.jpg';

const Login = () => {
  return (
    <div 
      className="min-h-screen flex flex-col lg:flex-row relative"
      style={{
        backgroundImage: `url(${loginBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Background Overlay for Better Readability */}
      <div className="absolute inset-0 bg-background/80 dark:bg-background/90 backdrop-blur-sm"></div>
      
      {/* Content - positioned above background */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row w-full">
        {/* Header with Dark Mode Toggle - Mobile */}
        <div className="lg:hidden flex justify-between items-center p-4 border-b bg-card/50 backdrop-blur-md">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">K</span>
            </div>
            <span className="font-semibold text-foreground">Kandypack</span>
          </div>
          <DarkModeToggle />
        </div>

        {/* Left Panel - Brand */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5">
          <div className="relative w-full">
            <BrandPane />
            {/* Dark Mode Toggle - Desktop */}
            <div className="absolute top-6 right-6">
              <DarkModeToggle />
            </div>
          </div>
        </div>

        {/* Right Panel - Auth Card */}
        <div className="flex-1 lg:w-1/2 xl:w-2/5 flex flex-col">
          <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
            <div className="w-full max-w-md">
              <AuthCard />
            </div>
          </div>
          
          {/* Footer with System Status */}
          <div className="p-6 border-t bg-card/50 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4">
              <SystemStatus />
              <div className="text-xs text-muted-foreground">
                © 2024 Kandypack Logistics. Secure platform.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;