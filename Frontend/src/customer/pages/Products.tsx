import { useState, useEffect, useMemo } from 'react';
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

// Define the Product interface to match the API response
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
      toast({
        title: 'Added to cart',
        description: `${quantity}x ${product.name} added to your cart.`,
      });
      setQuantity(1);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add item to cart.',
        variant: 'destructive',
      });
    }
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
              <Plus className="w-3 h-3 rotate-180" />
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

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  Details
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{product.name}</DialogTitle>
                  <DialogDescription>
                    {product.description}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p><strong>Price:</strong> Rs {product.price.toLocaleString()}</p>
                    <p><strong>Category:</strong> {product.category}</p>
                    <p><strong>Stock:</strong> {product.stock} units</p>
                    <p><strong>Space Consumption:</strong> {product.spaceConsumption} units per box</p>
                  </div>
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
  const [debouncedQuery, setDebouncedQuery] = useState(''); // debounce to avoid flicker
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high'>('name');
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(searchQuery.trim().toLowerCase()), 250);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Load ALL products once, then filter/sort/paginate locally
  useEffect(() => {
    const loadAllProducts = async () => {
      try {
        setIsLoading(true);

        // 1) fetch first page to know total pages
        const first = await fetchProducts('', 1, PAGE_SIZE);
        const firstBatch: Product[] = first.products.map((p: any) => ({
          id: p.product_id,
          name: p.name,
          description: p.description,
          price: p.unit_price,
          spaceConsumption: p.space_unit,
          stock: p.stock,
          sku: `SKU-${p.product_id.substring(0, 8)}`,
          category: 'Product',
          image: '/placeholder.svg',
        }));

        let combined = [...firstBatch];

        // 2) fetch remaining pages in parallel (if any)
        const totalPages: number = first.totalPages ?? 1;
        if (totalPages > 1) {
          const promises = [];
          for (let page = 2; page <= totalPages; page++) {
            promises.push(fetchProducts('', page, PAGE_SIZE));
          }
          const rest = await Promise.all(promises);
          for (const res of rest) {
            const batch: Product[] = res.products.map((p: any) => ({
              id: p.product_id,
              name: p.name,
              description: p.description,
              price: p.unit_price,
              spaceConsumption: p.space_unit,
              stock: p.stock,
              sku: `SKU-${p.product_id.substring(0, 8)}`,
              category: 'Product',
              image: '/placeholder.svg',
            }));
            combined = combined.concat(batch);
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

    loadAllProducts();
  }, []);

  // Derived list: filter by name, sort, then paginate
  const { visibleProducts, totalPages } = useMemo(() => {
    // filter by name (case-insensitive)
    const filtered = debouncedQuery
      ? allProducts.filter(p => p.name?.toLowerCase().includes(debouncedQuery))
      : allProducts;

    // sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
        default:
          return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      }
    });

    // paginate
    const total = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
    const page = Math.min(currentPage, total);
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return {
      visibleProducts: sorted.slice(start, end),
      totalPages: total,
    };
  }, [allProducts, debouncedQuery, sortBy, currentPage]);

  // Reset to page 1 whenever search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery, sortBy]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Products</h1>
        </div>

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
      </div>
    );
  }

  return (
    <div className="space-y-6">
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

      {visibleProducts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">Try adjusting your search terms.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2">
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
    </div>
  );
};

export default CustomerProducts;
