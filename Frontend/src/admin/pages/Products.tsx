import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Eye, Pencil, Trash2, Package, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '../../lib/config';
import { getAuthToken } from '@/lib/mockAuth';

interface Product {
  product_id: string;
  name: string;
  unit_price: number;
  stock: number;
  space_unit: number;
  description: string;
}

// const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => (
//   <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
//     }`}>
//     {type === 'success' ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
//     <span className="font-medium">{message}</span>
//     <button onClick={onClose} className="ml-2 text-gray-500 hover:text-gray-700">×</button>
//   </div>
// );



const ProductCard = ({ product, onView, onEdit, onDelete }: {
  product: Product;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  const getStockBadgeColor = (stock: number) => {
    if (stock === 0) return 'bg-red-100 text-red-800';
    if (stock < 20) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return 'Out of Stock';
    if (stock < 20) return 'Low Stock';
    return 'In Stock';
  };

  return (
    <>
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
              <CardDescription className="text-sm mt-1">
                {/* SKU: {product.sku} • {product.category} */}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col justify-between">
          <div className="space-y-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-primary">
                Rs {product.unit_price.toLocaleString()}
              </span>
              <Badge className={getStockBadgeColor(product.stock)}>
                {getStockStatus(product.stock)}
              </Badge>
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Stock:</span>
                <span className="font-medium">{product.stock} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Space:</span>
                <span className="font-medium">{product.space_unit} units/box</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              // variant="outline"
              // size="sm"
              onClick={onView}
              className="flex-1"
            >
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
            <Button
              // variant="outline"
              // size="sm"
              onClick={onEdit}
              className="flex-1"
            >
              <Pencil className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              // variant="outline"
              // size="sm"
              onClick={onDelete}
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  // const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [formData, setFormData] = useState<Product>({
    name: '',
    unit_price: 0,
    stock: 0,
    space_unit: 0,
    description: '',
    product_id: '',
  });

  const auth = getAuthToken();
  const { toast } = useToast();
  const ITEMS_PER_PAGE = 12;

  // const showToast = (message: string, type: 'success' | 'error') => {
  //   toast({
  //     message,
  //     type,
  //   });
  // };

  async function fetchProducts(): Promise<Product[]> {
    const response = await fetch(`${API_URL}/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    const data = await response.json();
    return data.products || [];
  }

  const searchAndSortProducts = (term: string, products: Product[], sort: string): Product[] => {
    let results = products;

    // Search
    const lowerTerm = term.toLowerCase().trim();
    if (lowerTerm) {
      results = results.filter(p =>
        p.name.toLowerCase().includes(lowerTerm)
        // p.sku.toLowerCase().includes(lowerTerm) ||
        // p.category.toLowerCase().includes(lowerTerm)
      );
    }

    // Sort
    switch (sort) {
      case 'price-low':
        results.sort((a, b) => a.unit_price - b.unit_price);
        break;
      case 'price-high':
        results.sort((a, b) => b.unit_price - a.unit_price);
        break;
      case 'stock-low':
        results.sort((a, b) => a.stock - b.stock);
        break;
      case 'stock-high':
        results.sort((a, b) => b.stock - a.stock);
        break;
      case 'name':
      default:
        results.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return results;
  };

  useEffect(() => {
    const results = searchAndSortProducts(searchTerm, products, sortBy);
    setFilteredProducts(results);
    setCurrentPage(1);
  }, [searchTerm, products, sortBy]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchProducts();
      setProducts(data || []);
      setFilteredProducts(data || []);
    } catch (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = () => {
    setFormData({
      name: '',
      unit_price: 0,
      space_unit: 0,
      description: '',
      product_id: '',
      stock: 0,
    });
    setIsEditing(false);
    setIsFormModalOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setFormData({
      product_id: product.product_id,
      name: product.name,
      unit_price: product.unit_price,
      stock: product.stock,
      space_unit: product.space_unit,
      description: product.description,
    });
    setIsEditing(true);
    setIsFormModalOpen(true);
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsViewModalOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedProduct) {
      try {
        const response = await fetch(`${API_URL}/products/${selectedProduct.product_id}`, {
          method: "DELETE",
          headers: {
            'Authorization': `Bearer ${auth.token}`
          }
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to delete product");
        }
        toast({
          title: "Success",
          description: "Product deleted successfully",
        });
        await loadProducts();
      } catch (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsDeleteDialogOpen(false);
        setSelectedProduct(null);
      }
    }
  };

  const handleSubmitForm = async () => {
    try {
      const productData = {
        name: formData.name,
        unit_price: formData.unit_price,
        stock: formData.stock,
        space_unit: formData.space_unit,
        description: formData.description,
      };

      if (isEditing && selectedProduct) {
        const response = await fetch(`${API_URL}/products/${selectedProduct.product_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.token}`
          },
          body: JSON.stringify(productData),
        });
        if (!response.ok) throw new Error('Failed to update product');
        toast({
          title: "Success",
          description: "Product updated successfully",
        });
      } else {
        const response = await fetch(`${API_URL}/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.token}`
          },
          body: JSON.stringify(productData),
        });
        if (!response.ok) throw new Error('Failed to add product');
        toast({
          title: "Success",
          description: "Product added successfully",
        });
      }
      await loadProducts();
      setIsFormModalOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'add'} product`,
        variant: "destructive",
      });
    }
  };

  const getStockBadgeColor = (stock: number) => {
    if (stock === 0) return 'bg-red-100 text-red-800';
    if (stock < 20) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) return 'Out of Stock';
    if (stock < 20) return 'Low Stock';
    return 'In Stock';
  };

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />} */}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Product Management</h2>
          <p className="text-muted-foreground">
            Manage your inventory and product catalog
          </p>
        </div>
        <Button onClick={handleAddProduct}>
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter((p) => p.stock > 0).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter((p) => p.stock > 0 && p.stock < 20).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.filter((p) => p.stock === 0).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="price-low">Price (Low to High)</SelectItem>
            <SelectItem value="price-high">Price (High to Low)</SelectItem>
            <SelectItem value="stock-low">Stock (Low to High)</SelectItem>
            <SelectItem value="stock-high">Stock (High to Low)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Products Grid */}
      {currentProducts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or add a new product.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentProducts.map((product) => (
              <ProductCard
                key={product.product_id}
                product={product}
                onView={() => handleViewProduct(product)}
                onEdit={() => handleEditProduct(product)}
                onDelete={() => handleDeleteProduct(product)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2">
              <Button
                // variant="outline"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Previous
              </Button>
              <span className="flex items-center px-4">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                // variant="outline"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>
              View complete product information
            </DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <p className="font-medium">{selectedProduct.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">SKU</Label>
                {/* <p className="font-medium">{selectedProduct.sku}</p> */}
              </div>
              <div>
                <Label className="text-muted-foreground">Category</Label>
                {/* <p className="font-medium">{selectedProduct.category}</p> */}
              </div>
              <div>
                <Label className="text-muted-foreground">Price</Label>
                <p className="font-medium">Rs {selectedProduct.unit_price.toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Stock</Label>
                <p>
                  <Badge className={getStockBadgeColor(selectedProduct.stock)}>
                    {getStockStatus(selectedProduct.stock)} ({selectedProduct.stock} units)
                  </Badge>
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Space Consumption</Label>
                <p className="font-medium">{selectedProduct.space_unit} units per box</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="font-medium">{selectedProduct.description}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Modal */}
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update product information' : 'Enter new product details'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Product name"
              />
            </div>
            {/* <div>
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                placeholder="SKU-001"
              />
            </div> */}
            {/* <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Electronics, Groceries, etc."
              />
            </div> */}
            <div>
              <Label htmlFor="price">Price (Rs)</Label>
              <Input
                id="price"
                type="number"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="stock">Stock Quantity</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                placeholder="0"
              />
            </div>
            <div>
              <Label htmlFor="space_unit">Space Consumption (units per box)</Label>
              <Input
                id="space_unit"
                type="number"
                value={formData.space_unit}
                onChange={(e) => setFormData({ ...formData, space_unit: parseFloat(e.target.value) })}
                placeholder="0.0"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Product description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              // variant="outline" 
              onClick={() => setIsFormModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitForm}>
              {isEditing ? 'Update' : 'Add'} Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the product{' '}
              <span className="font-semibold">{selectedProduct?.name}</span>. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminProducts;