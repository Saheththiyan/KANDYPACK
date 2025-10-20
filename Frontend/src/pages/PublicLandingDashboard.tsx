import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { SystemStatus } from '@/components/SystemStatus';
import { auth } from '@/lib/auth';

const PublicLandingDashboard = () => {
  const navigate = useNavigate();
  const authData = auth.get();

  // If already authenticated, redirect to appropriate dashboard
  if (authData) {
    if (authData.role === 'Customer') {
      navigate('/customer');
    } else if (authData.role === 'Admin') {
      navigate('/admin');
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Kandypack</h1>
          <div className="flex items-center gap-4">
            <DarkModeToggle />
            <Button asChild variant="default">
              <Link to="/login?redirect=/">Sign in</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="max-w-2xl w-full space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              Welcome to Kandypack Logistics
            </h2>
            <p className="text-xl text-muted-foreground">
              Your trusted partner for household and cleaning products
            </p>
          </div>

          {/* Browse Products Card */}
          <Card className="hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/50">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-center mb-4">
                <div className="p-4 rounded-full bg-primary/10">
                  <ShoppingBag className="w-12 h-12 text-primary" />
                </div>
              </div>
              <CardTitle className="text-3xl text-center">Browse Products</CardTitle>
              <CardDescription className="text-center text-lg">
                Explore our wide range of Kandypack products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full h-12 text-lg" size="lg">
                <Link to="/products">
                  View All Products
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Guest Notice */}
          <div className="text-center text-sm text-muted-foreground">
            <p>You're browsing as a guest. Sign in to place orders and track deliveries.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center space-y-4">
            <SystemStatus />
            <p className="text-sm text-muted-foreground text-center">
              © 2025 Kandypack Logistics. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLandingDashboard;
