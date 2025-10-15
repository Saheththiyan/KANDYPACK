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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Top accent line */}
      <div className="h-1 bg-gradient-to-r from-primary via-primary/70 to-purple-500/80" />

      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/70"
        role="banner"
      >
        <div className="flex h-16 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            <div className="flex items-center gap-3">
              <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-violet-600 shadow-inner flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm tracking-wide">K</span>
              </div>
              <div className="leading-tight">
                <h1 className="font-semibold text-foreground">Kandypack Admin</h1>
                <p className="text-xs text-muted-foreground">Management Portal</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-foreground">{auth?.name}</p>
              <p className="text-xs text-muted-foreground">
                {auth?.role} • {auth?.email}
              </p>
            </div>
            <DarkModeToggle />
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={[
            'fixed lg:static inset-y-0 left-0 z-40 w-72 transform transition-transform duration-200 ease-in-out',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
            'border-r bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/70',
            'mt-16 lg:mt-0'
          ].join(' ')}
          aria-label="Primary"
        >
          <nav className="p-4">
            {/* Section: Main */}
            <div className="px-3 pb-2">
              <p className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground/70">
                Overview
              </p>
            </div>

            {navItems
              .filter((n) => !n.children)
              .map((item) => {
                const Icon = item.icon;
                const active = isActivePath(item.path, item.exact);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={[
                      'group relative flex items-center gap-3 px-3 py-2.5 text-sm rounded-md transition-colors',
                      active
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                    ].join(' ')}
                  >
                    {/* left active rail */}
                    <span
                      className={[
                        'absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r',
                        active ? 'bg-primary-foreground/80' : 'bg-transparent'
                      ].join(' ')}
                    />
                    <Icon className="h-4.5 w-4.5 opacity-90" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}

            {/* Separator */}
            <div className="my-3 border-t border-border/60" />

            {/* Section: Reports */}
            <div className="px-3 pb-2">
              <p className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground/70">
                Reports
              </p>
            </div>

            {navItems
              .filter((n) => n.children)
              .map((group) => {
                const GroupIcon = group.icon;
                return (
                  <div key={group.label} className="mb-2">
                    <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground">
                      <GroupIcon className="h-4 w-4" />
                      <span>{group.label}</span>
                    </div>
                    <div className="ml-2 space-y-1.5">
                      {group.children!.map((child) => {
                        const ChildIcon = child.icon;
                        const active = isActivePath(child.path);
                        return (
                          <Link
                            key={child.path}
                            to={child.path}
                            onClick={() => setSidebarOpen(false)}
                            className={[
                              'group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                              active
                                ? 'bg-primary/90 text-primary-foreground shadow-sm'
                                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                            ].join(' ')}
                          >
                            <span
                              className={[
                                'absolute left-0 top-1/2 -translate-y-1/2 h-4 w-1 rounded-r',
                                active ? 'bg-primary-foreground/80' : 'bg-transparent'
                              ].join(' ')}
                            />
                            <ChildIcon className="h-4 w-4" />
                            <span>{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </nav>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close sidebar overlay"
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          {/* Content canvas */}
          <div className="mx-auto max-w-[1400px]">
            <div className="rounded-2xl border bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/70 shadow-sm p-2 sm:p-3">
              <div className="rounded-xl border bg-background p-3 sm:p-6">
                <Outlet />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
