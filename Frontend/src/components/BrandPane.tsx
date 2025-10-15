import { Truck, Train, MapPin } from 'lucide-react';

export const BrandPane = () => {
  return (
    <div className="flex flex-col justify-center min-h-screen p-8 lg:p-12 relative overflow-hidden">
      {/* Semi-transparent overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-background/90 via-background/80 to-background/70 dark:from-background/95 dark:via-background/90 dark:to-background/85"></div>
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute inset-0">
          <defs>
            <pattern id="dots" width="10" height="10" patternUnits="userSpaceOnUse">
              <circle cx="5" cy="5" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-md mx-auto lg:max-w-none lg:mx-0">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="relative">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-elegant">
              <span className="text-primary-foreground font-bold text-xl">K</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-lg flex items-center justify-center">
              <Train className="h-3 w-3 text-success-foreground" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Kandypack Logistics</h1>
            <p className="text-sm text-muted-foreground">Rail & Road Distribution Platform</p>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="space-y-6">
          <h2 className="text-3xl lg:text-4xl font-bold text-foreground leading-tight text-balance">
            Plan rail trips, dispatch routes, and track deliveries across Sri Lanka.
          </h2>
          
          <p className="text-lg text-muted-foreground leading-relaxed">
            Streamline your logistics operations with our integrated platform designed for Sri Lankan businesses.
          </p>

          {/* Features */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Train className="h-4 w-4 text-primary" />
              </div>
              <span className="text-foreground font-medium">Rail trip planning & scheduling</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-success/10 rounded-lg flex items-center justify-center">
                <Truck className="h-4 w-4 text-success" />
              </div>
              <span className="text-foreground font-medium">Road dispatch optimization</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-warning/10 rounded-lg flex items-center justify-center">
                <MapPin className="h-4 w-4 text-warning" />
              </div>
              <span className="text-foreground font-medium">Real-time delivery tracking</span>
            </div>
          </div>
        </div>

        {/* Sri Lanka Cities - Subtle Background */}
        <div className="mt-12 opacity-60">
          <p className="text-sm font-medium text-muted-foreground mb-3">Serving major cities</p>
          <div className="flex flex-wrap gap-2 text-xs">
            {['Kandy', 'Colombo', 'Negombo', 'Galle', 'Matara', 'Jaffna', 'Trincomalee'].map((city) => (
              <span 
                key={city} 
                className="px-2 py-1 bg-muted/50 text-muted-foreground rounded-md"
              >
                {city}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};