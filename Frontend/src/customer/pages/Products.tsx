import { useState, useEffect } from 'react';
import { Search, ShoppingCart, Plus, Minus, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchProducts, addToCart } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { getAuthToken } from '@/lib/mockAuth';
import { API_URL } from '@/lib/config';

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

const PAGE_SIZE = 16;

const ProductCard = ({ product }: { product: Product }) => {
  const [quantity, setQuantity] = useState(1);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddToCart = () => {
    try {
      addToCart(product, quantity);
      toast({ title: 'Added to cart', description: `${quantity}x ${product.name} added to your cart.` });
      setQuantity(1);
    } catch {
      toast({ title: 'Error', description: 'Failed to add item to cart.', variant: 'destructive' });
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
        <CardDescription className="text-sm">SKU: {product.sku} • {product.category}</CardDescription>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">Rs {product.price.toLocaleString()}</span>
            <Badge variant={product.stock > 0 ? 'secondary' : 'destructive'}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">Space: {product.spaceConsumption} units/box</p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="h-8 w-8 p-0">
              <Minus className="w-3 h-3 rotate-180" />
            </Button>
            <span className="w-8 text-center font-medium">{quantity}</span>
            <Button variant="outline" size="sm" onClick={() => setQuantity(quantity + 1)} className="h-8 w-8 p-0">
              <Plus className="w-3 h-3" />
            </Button>
          </div>

          <div className="flex space-x-2">
            <Button onClick={handleAddToCart} disabled={product.stock === 0} className="flex-1" size="sm">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </Button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">Details</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{product.name}</DialogTitle>
                  <DialogDescription>{product.description}</DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
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
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high'>('name');

  const [currentPage, setCurrentPage] = useState(1);
  const [serverTotalPages, setServerTotalPages] = useState(1);
  const [serverTotal, setServerTotal] = useState(0);

  // debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // fetch page from server whenever search/sort/page changes
  const [totalPages, setTotalPages] = useState(1);

  const auth = getAuthToken();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_URL}/products?search=${encodeURIComponent(searchQuery)}&page=${currentPage}&sortBy=${sortBy}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.token}`
          },
        }).then(res => res.json());

        // Sort products
        let sortedProducts = [...res.products];
        switch (sortBy) {
          case 'price-low':
            sortedProducts.sort((a, b) => a.price - b.price);
            break;
          case 'price-high':
            sortedProducts.sort((a, b) => b.price - a.price);
            break;
          case 'name':
          default:
            sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        }
        // const res = await fetchProducts(debouncedQuery, currentPage, PAGE_SIZE, sortBy);
        if (cancelled) return;

        // api.ts already normalizes; this is a safety mapping if needed:
        const mapped: Product[] = res.products.map((p: any) => ({
          id: p.product_id ?? p.id,
          name: p.name,
          description: p.description,
          price: Number(p.unit_price ?? p.price),
          spaceConsumption: Number(p.space_unit ?? p.spaceConsumption),
          stock: Number(p.stock ?? 0),
          sku: `SKU-${String(p.product_id ?? p.id).substring(0, 8)}`,
          category: p.category ?? 'Product',
          image: '/placeholder.svg',
        }));
        setProducts(mapped);
        setServerTotal(res.total);
        setServerTotalPages(res.totalPages);
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load products:', error);
          toast({ title: 'Error', description: 'Failed to load products. Please try again.', variant: 'destructive' });
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [debouncedQuery, sortBy, currentPage]);

  // reset to page 1 when search/sort changes
  useEffect(() => { setCurrentPage(1); }, [debouncedQuery, sortBy]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Products</h1>
        <Badge variant="secondary">{serverTotal} product{serverTotal !== 1 ? 's' : ''}</Badge>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search products by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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

      {/* Loading / Empty / Grid */}
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
      ) : products.length === 0 ? (
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
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {serverTotalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <Button
                variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {currentPage} of {serverTotalPages}
              </span>
              <Button
                variant="outline"
                disabled={currentPage === serverTotalPages}
                onClick={() => setCurrentPage((p) => Math.min(serverTotalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CustomerProducts;
