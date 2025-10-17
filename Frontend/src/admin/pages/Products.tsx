import { useState, useEffect } from 'react';
import { Search, Plus, Eye, Pencil, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Product,
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
} from '@/lib/queries';

export const Products = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price'>('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const itemsPerPage = 10;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    unit_price: '',
    space_unit: '',
  });

  useEffect(() => {
    loadProducts();
  }, [searchTerm, sortBy]);

  const loadProducts = () => {
    setLoading(true);
    try {
      const data = searchTerm
        ? searchProducts(searchTerm, sortBy)
        : getAllProducts(sortBy);
      setProducts(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewProduct = (productId: string) => {
    const product = getProductById(productId);
    if (product) {
      setSelectedProduct(product);
      setIsViewModalOpen(true);
    }
  };

  const handleEditProduct = (productId: string) => {
    const product = getProductById(productId);
    if (product) {
      setSelectedProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        unit_price: product.unit_price.toString(),
        space_unit: product.space_unit.toString(),
      });
      setIsEditModalOpen(true);
    }
  };

  const handleDeleteClick = (productId: string) => {
    setProductToDelete(productId);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (productToDelete) {
      try {
        deleteProduct(productToDelete);
        loadProducts();
        toast({
          title: 'Success',
          description: 'Product deleted successfully',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete product',
          variant: 'destructive',
        });
      }
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const handleAddProduct = () => {
    if (!formData.name || !formData.unit_price || !formData.space_unit) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (parseFloat(formData.unit_price) <= 0) {
      toast({
        title: 'Error',
        description: 'Unit price must be greater than 0',
        variant: 'destructive',
      });
      return;
    }

    if (parseInt(formData.space_unit) < 0) {
      toast({
        title: 'Error',
        description: 'Space unit must be 0 or greater',
        variant: 'destructive',
      });
      return;
    }

    try {
      addProduct({
        name: formData.name,
        description: formData.description,
        unit_price: parseFloat(formData.unit_price),
        space_unit: parseInt(formData.space_unit),
      });
      loadProducts();
      setIsAddModalOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Product added successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add product',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateProduct = () => {
    if (!selectedProduct || !formData.name || !formData.unit_price || !formData.space_unit) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (parseFloat(formData.unit_price) <= 0) {
      toast({
        title: 'Error',
        description: 'Unit price must be greater than 0',
        variant: 'destructive',
      });
      return;
    }

    if (parseInt(formData.space_unit) < 0) {
      toast({
        title: 'Error',
        description: 'Space unit must be 0 or greater',
        variant: 'destructive',
      });
      return;
    }

    try {
      updateProduct(selectedProduct.product_id, {
        name: formData.name,
        description: formData.description,
        unit_price: parseFloat(formData.unit_price),
        space_unit: parseInt(formData.space_unit),
      });
      loadProducts();
      setIsEditModalOpen(false);
      resetForm();
      toast({
        title: 'Success',
        description: 'Product updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update product',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      unit_price: '',
      space_unit: '',
    });
    setSelectedProduct(null);
  };

  const paginatedProducts = products.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(products.length / itemsPerPage);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Products</h1>
        <p className="text-muted-foreground">Manage your product catalog</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
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
            <CardTitle className="text-sm font-medium">Avg. Price</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.length > 0
                ? formatCurrency(
                    products.reduce((sum, p) => sum + p.unit_price, 0) / products.length
                  )
                : '$0.00'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Space Units</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {products.reduce((sum, p) => sum + p.space_unit, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Select value={sortBy} onValueChange={(value: 'name' | 'price') => setSortBy(value)}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setIsAddModalOpen(true)} className="whitespace-nowrap">
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No products found</h3>
              <p className="text-muted-foreground">Get started by adding your first product.</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Space Unit</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedProducts.map((product) => (
                      <TableRow key={product.product_id}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell className="max-w-xs truncate" title={product.description}>
                          {product.description}
                        </TableCell>
                        <TableCell>{formatCurrency(product.unit_price)}</TableCell>
                        <TableCell>{product.space_unit}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewProduct(product.product_id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditProduct(product.product_id)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteClick(product.product_id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, products.length)} of {products.length}{' '}
                    products
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* View Product Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>View product information</DialogDescription>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <p className="font-medium">{selectedProduct.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p>{selectedProduct.description || 'No description'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Unit Price</Label>
                  <p className="font-medium">{formatCurrency(selectedProduct.unit_price)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Space Unit</Label>
                  <p className="font-medium">{selectedProduct.space_unit}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Product Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>Enter the product details below</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Product name"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Product description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="unit_price">Unit Price * ($)</Label>
                <Input
                  id="unit_price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.unit_price}
                  onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="space_unit">Space Unit *</Label>
                <Input
                  id="space_unit"
                  type="number"
                  min="0"
                  value={formData.space_unit}
                  onChange={(e) => setFormData({ ...formData, space_unit: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAddModalOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleAddProduct}>Add Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update the product details below</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Product name"
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Product description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-unit_price">Unit Price * ($)</Label>
                <Input
                  id="edit-unit_price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.unit_price}
                  onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label htmlFor="edit-space_unit">Space Unit *</Label>
                <Input
                  id="edit-space_unit"
                  type="number"
                  min="0"
                  value={formData.space_unit}
                  onChange={(e) => setFormData({ ...formData, space_unit: e.target.value })}
                  placeholder="0"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsEditModalOpen(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateProduct}>Update Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product from the
              database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
