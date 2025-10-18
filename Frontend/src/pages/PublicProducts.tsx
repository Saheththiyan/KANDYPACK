import { useState, useEffect, useMemo } from 'react';
import { Search, ShoppingCart, Plus, Minus, Package, LogIn } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchProducts } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { useNavigate, Link } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  spaceConsumption: number;
  stock: number;
  sku: string;
  category: string;
  image: string;
}

const PAGE_SIZE = 12;

const SignInPrompt = ({
  open,
  onOpenChange,
  redirect = '/products',
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  redirect?: string;
}) => {
  const navigate = useNavigate();
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogIn className="w-5 h-5" />
            Sign in required
          </DialogTitle>
          <DialogDescription>
            Please sign in to add items to your cart and checkout.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            className="flex-1"
            onClick={() => navigate(`/login?redirect=${encodeURIComponent(redirect)}`)}
          >
            <LogIn className="w-4 h-4 mr-2" />
            Sign in
          </Button>
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Keep browsing
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ProductCard = ({
  product,
  onRequireSignin,
}: {
  product: Product;
  onRequireSignin: () => void;
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleAddToCart = () => {
    onRequireSignin();
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
        <CardDescription className="text-sm">
          SKU: {product.sku} • {product.category}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">
              Rs {product.price.toLocaleString()}
            </span>
            <Badge variant={product.stock > 0 ? 'secondary' : 'destructive'}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Space: {product.spaceConsumption} units/box
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="h-8 w-8 p-0"
            >
              <Minus className="w-3 h-3" />
            </Button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setQuantity(quantity + 1)}
              className="h-8 w-8 p-0"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          <div className="flex space-x-2">
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="flex-1"
              size="sm"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>

            {/* Details dialog */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
              <Button variant="outline" size="sm" onClick={() => setIsDetailsOpen(true)}>
                Details
              </Button>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{product.name}</DialogTitle>
                  <DialogDescription>{product.description}</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <p><strong>Price:</strong> Rs {product.price.toLocaleString()}</p>
                  <p><strong>Category:</strong> {product.category}</p>
                  <p><strong>Stock:</strong> {product.stock} units</p>
                  <p><strong>Space Consumption:</strong> {product.spaceConsumption} units per box</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CustomerProducts = () => {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high'>('name');

  const [currentPage, setCurrentPage] = useState(1);
  const [signinOpen, setSigninOpen] = useState(false);

  // guest mode
  useEffect(() => {
    localStorage.clear();
    sessionStorage.clear();
  }, []);

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // load ALL products once, then filter/sort/paginate locally
  useEffect(() => {
    const loadAll = async () => {
      try {
        setIsLoading(true);

        // 1) first page to know total pages
        const first = await fetchProducts('', 1, PAGE_SIZE);
        const toProduct = (p: any): Product => ({
          id: p.product_id,
          name: p.name,
          description: p.description,
          price: Number(p.unit_price),
          spaceConsumption: p.space_unit,
          stock: p.stock,
          sku: `SKU-${p.product_id.substring(0, 8)}`,
          category: 'Product',
          image: '/placeholder.svg',
        });

        let combined: Product[] = first.products.map(toProduct);

        const totalPages = Math.max(1, Number(first.totalPages ?? 1));
        if (totalPages > 1) {
          const promises = [];
          for (let page = 2; page <= totalPages; page++) {
            promises.push(fetchProducts('', page, PAGE_SIZE));
          }
          const rest = await Promise.all(promises);
          for (const res of rest) {
            combined = combined.concat(res.products.map(toProduct));
          }
        }

        setAllProducts(combined);
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
    loadAll();
  }, []);

  // derive filtered/sorted/paginated view
  const { visibleProducts, totalPages, totalFiltered } = useMemo(() => {
    const filtered = debouncedQuery
      ? allProducts.filter(p => p.name?.toLowerCase().includes(debouncedQuery))
      : allProducts;

    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        default:
          return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      }
    });

    const total = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    const page = Math.min(currentPage, total);
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;

    return {
      visibleProducts: sorted.slice(start, end),
      totalPages: total,
      totalFiltered: sorted.length,
    };
  }, [allProducts, debouncedQuery, sortBy, currentPage]);

  // jump back to page 1 when search/sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery, sortBy]);

  const handleSearch = (q: string) => setSearchQuery(q);

  return (
    <div className="container mx-auto px-6 py-8 space-y-8 max-w-7xl">
      {/* Top guest notice banner */}
      <div className="flex items-center justify-between p-4 border rounded-md bg-muted/30">
        <p className="text-sm">
          You’re browsing as a guest.{' '}
          <span className="text-muted-foreground">
            Sign in to add items to your cart and checkout.
          </span>
        </p>
        <Button asChild>
          <Link to="/login?redirect=/products">
            <LogIn className="w-4 h-4 mr-2" />
            Sign in
          </Link>
        </Button>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search products by name..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name (A–Z)</SelectItem>
            <SelectItem value="price-low">Price (Low → High)</SelectItem>
            <SelectItem value="price-high">Price (High → Low)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Product grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="h-full">
              <CardHeader>
                <Skeleton className="aspect-square rounded-lg mb-3" />
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
      ) : visibleProducts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onRequireSignin={() => setSigninOpen(true)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center space-x-2 pt-4">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Sign-in popup */}
      <SignInPrompt open={signinOpen} onOpenChange={setSigninOpen} redirect="/products" />
    </div>
  );
};

export default CustomerProducts;
