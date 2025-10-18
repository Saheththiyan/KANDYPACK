import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ShoppingCart, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { getAllProducts, Product } from '@/lib/queries';
import { auth } from '@/lib/auth';
import { toast } from '@/hooks/use-toast';

const ProductDetailDialog = ({ 
  product, 
  open, 
  onOpenChange 
}: { 
  product: Product; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) => {
  const navigate = useNavigate();

  const handleSignInToBuy = () => {
    navigate(`/login?redirect=/products&productId=${product.product_id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{product.name}</DialogTitle>
          <DialogDescription>
            {product.description}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <p><strong>Price:</strong> Rs {product.unit_price.toLocaleString()}</p>
            <p><strong>Space Unit:</strong> {product.space_unit}</p>
          </div>
          <Button onClick={handleSignInToBuy} className="w-full" size="lg">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Sign in to buy
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ProductCard = ({ product }: { product: Product }) => {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const authData = auth.get();

  const handleSignInToBuy = () => {
    navigate(`/login?redirect=/products&productId=${product.product_id}`);
  };

  return (
    <>
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
          <CardDescription className="text-sm line-clamp-2">
            {product.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col justify-between">
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-primary">
                Rs {product.unit_price.toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Space: {product.space_unit} units
            </p>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={handleSignInToBuy}
              className="flex-1"
              size="sm"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Sign in to buy
            </Button>

            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsDialogOpen(true)}
            >
              Details
            </Button>
          </div>
        </CardContent>
      </Card>

      <ProductDetailDialog
        product={product}
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
};

const PublicProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name');
  const [searchParams] = useSearchParams();
  const authData = auth.get();

  // Load products on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const data = getAllProducts(sortBy);
        setProducts(data);
        setFilteredProducts(data);
      } catch (error) {
        console.error('Failed to load products:', error);
        toast({
          title: 'Error',
          description: 'Failed to load products. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [sortBy]);

  // Handle search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = products.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.description.toLowerCase().includes(query)
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  // Auto-open product detail if productId in URL
  useEffect(() => {
    const productId = searchParams.get('productId');
    if (productId && products.length > 0) {
      const product = products.find(p => p.product_id === productId);
      if (product) {
        // Open product detail modal
        // This would require managing dialog state globally or through URL
        toast({
          title: 'Product found',
          description: `Showing details for ${product.name}`,
        });
      }
    }
  }, [searchParams, products]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-background/95 backdrop-blur">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-primary">Kandypack Products</h1>
          </div>
        </header>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="h-full">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-1/3 mb-4" />
                  <Skeleton className="h-9 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-primary">Kandypack Products</h1>
          </div>
          <div className="flex items-center gap-4">
            <DarkModeToggle />
            {!authData && (
              <Button asChild variant="default">
                <Link to="/login?redirect=/products">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Guest Notice */}
        {!authData && (
          <Alert className="mb-6">
            <AlertDescription>
              You're browsing as a guest. <Link to="/login?redirect=/products" className="font-medium underline">Sign in</Link> to add items to your cart and place orders.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold">All Products</h2>
            <Badge variant="secondary">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
            </Badge>
          </div>

          {/* Search and Sort */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={sortBy} onValueChange={(value: 'name' | 'price') => setSortBy(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name (A-Z)</SelectItem>
                <SelectItem value="price">Price</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {filteredProducts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <h3 className="text-lg font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search terms.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.product_id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicProducts;
