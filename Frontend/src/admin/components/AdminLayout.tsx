import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  FileText, 
  TrendingUp, 
  Package, 
  MapPin, 
  Clock, 
  Truck, 
  Users,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { getAuthToken } from '@/lib/mockAuth';
import { useState } from 'react';
import path from 'path';

export const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuthToken();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('kandypack_user');
    navigate('/login');
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { path: '/admin/customers', label: 'Customers', icon: Users },
    { path: '/admin/products', label: 'Products', icon: Package },
    { 
      label: 'Reports', 
      icon: FileText, 
      children: [
        { path: '/admin/reports/quarterly-sales', label: 'Quarterly Sales', icon: TrendingUp },
        { path: '/admin/reports/most-ordered', label: 'Most Ordered Items', icon: Package },
        { path: '/admin/reports/city-route-breakdown', label: 'City/Route Breakdown', icon: MapPin },
        { path: '/admin/reports/driver-hours', label: 'Driver Hours', icon: Clock },
        { path: '/admin/reports/truck-usage', label: 'Truck Usage', icon: Truck },
        { path: '/admin/reports/customer-history', label: 'Customer History', icon: Users },
      ]
    },
  ];

  const isActivePath = (path: string, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">K</span>
              </div>
              <div>
                <h1 className="font-semibold text-foreground">Kandypack Admin</h1>
                <p className="text-xs text-muted-foreground">Management Portal</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-foreground">{auth?.name}</p>
              <p className="text-xs text-muted-foreground">{auth?.role} • {auth?.email}</p>
            </div>
            <DarkModeToggle />
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          border-r bg-card/30 backdrop-blur supports-[backdrop-filter]:bg-card/50 mt-16 lg:mt-0
        `}>
          <nav className="space-y-1 p-4">
            {navItems.map((item) => {
              if (item.children) {
                return (
                  <div key={item.label} className="space-y-1">
                    <div className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-muted-foreground">
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </div>
                    <div className="ml-4 space-y-1">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        const isActive = isActivePath(child.path);
                        return (
                          <Link
                            key={child.path}
                            to={child.path}
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-md transition-colors ${
                              isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            }`}
                          >
                            <ChildIcon className="h-4 w-4" />
                            <span>{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              const Icon = item.icon;
              const isActive = isActivePath(item.path, item.exact);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm rounded-md transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
