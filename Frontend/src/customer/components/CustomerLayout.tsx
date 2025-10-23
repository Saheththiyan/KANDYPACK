import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Package, ShoppingCart, ClipboardList, LogOut, User } from 'lucide-react';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { getAuthToken } from '@/lib/mockAuth';

export const CustomerLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuthToken();

  const handleLogout = () => {
    localStorage.removeItem('auth');
    navigate('/login');
  };

  const navItems = [
    { path: '/customer', label: 'Home', icon: Home },
    { path: '/customer/products', label: 'Products', icon: Package },
    { path: '/customer/cart', label: 'Cart', icon: ShoppingCart },
    { path: '/customer/orders', label: 'Orders', icon: ClipboardList },
    { path: '/customer/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-50">
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">K</span>
              </div>
              <div>
                <h1 className="font-semibold text-foreground">Kandypack</h1>
                <p className="text-xs text-muted-foreground">Customer Portal</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-foreground">{auth?.name}</p>
              <p className="text-xs text-muted-foreground">{auth?.email}</p>
            </div>
            <DarkModeToggle />
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="border-t px-4 lg:px-6">
          <div className="flex space-x-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isHome = item.path === '/customer';
              const isActive = isHome
                ? location.pathname === item.path
                : location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-6">
        <Outlet />
      </main>
    </div>
  );
};
