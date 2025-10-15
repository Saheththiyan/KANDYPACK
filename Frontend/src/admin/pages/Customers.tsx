import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { useToast } from '@/hooks/use-toast';
import { Search, Plus, Eye, Pencil, Trash2, Users, Building2, ShoppingBag } from 'lucide-react';
import { initDatabase } from '@/lib/db';
import {
  getAllCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  searchCustomers,
  Customer,
} from '@/lib/queries';

const ITEMS_PER_PAGE = 10;

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Retail' as 'Retail' | 'Wholesale' | 'Corporate',
    address: '',
    city: '',
    phone: '',
    email: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    loadCustomers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const results = searchCustomers(searchTerm);
      setFilteredCustomers(results);
    }
    setCurrentPage(1);
  }, [searchTerm, customers]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      await initDatabase();
      const data = getAllCustomers();
      setCustomers(data);
      setFilteredCustomers(data);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to load customers',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = () => {
    setFormData({
      name: '',
      type: 'Retail',
      address: '',
      city: '',
      phone: '',
      email: '',
    });
    setIsEditing(false);
    setIsFormModalOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      type: customer.type,
      address: customer.address,
      city: customer.city,
      phone: customer.phone,
      email: customer.email,
    });
    setIsEditing(true);
    setIsFormModalOpen(true);
  };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsViewModalOpen(true);
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedCustomer) {
      try {
        deleteCustomer(selectedCustomer.customer_id);
        loadCustomers();
        toast({
          title: 'Success',
          description: 'Customer deleted successfully',
        });
      } catch {
        toast({
          title: 'Error',
          description: 'Failed to delete customer',
          variant: 'destructive',
        });
      }
      setIsDeleteDialogOpen(false);
      setSelectedCustomer(null);
    }
  };

  const handleSubmitForm = () => {
    try {
      if (isEditing && selectedCustomer) {
        updateCustomer(selectedCustomer.customer_id, formData);
        toast({
          title: 'Success',
          description: 'Customer updated successfully',
        });
      } else {
        addCustomer(formData);
        toast({
          title: 'Success',
          description: 'Customer added successfully',
        });
      }
      loadCustomers();
      setIsFormModalOpen(false);
      setSelectedCustomer(null);
    } catch {
      toast({
        title: 'Error',
        description: `Failed to ${isEditing ? 'update' : 'add'} customer`,
        variant: 'destructive',
      });
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'Retail':
        return 'bg-blue-100 text-blue-800';
      case 'Wholesale':
        return 'bg-green-100 text-green-800';
      case 'Corporate':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentCustomers = filteredCustomers.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Small radial percentage (just aesthetic, not data-driven)
  const total = customers.length;
  const retail = customers.filter(c => c.type === 'Retail').length;
  const wholesale = customers.filter(c => c.type === 'Wholesale').length;
  const corp = customers.filter(c => c.type === 'Corporate').length;

  return (
    <div className="space-y-6">
      {/* header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Customer Management</h2>
        <p className="text-muted-foreground">
          Manage, add, and analyze your customer base.
        </p>
      </div>

      {/* analytics overview */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Customer Overview
          </CardTitle>
          <CardDescription>Customer distribution by type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
                <ShoppingBag className="text-blue-600 h-6 w-6" />
              </div>
              <h4 className="mt-2 font-semibold text-foreground">{retail}</h4>
              <p className="text-sm text-muted-foreground">Retail Customers</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
                <Users className="text-green-600 h-6 w-6" />
              </div>
              <h4 className="mt-2 font-semibold text-foreground">{wholesale}</h4>
              <p className="text-sm text-muted-foreground">Wholesale Customers</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center">
                <Building2 className="text-purple-600 h-6 w-6" />
              </div>
              <h4 className="mt-2 font-semibold text-foreground">{corp}</h4>
              <p className="text-sm text-muted-foreground">Corporate Clients</p>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Total Customers: <span className="font-semibold text-foreground">{total}</span>
          </div>
        </CardContent>
      </Card>

      {/* main table section */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3 flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
          <div>
            <CardTitle>Customer List</CardTitle>
            <CardDescription>View, search, and manage all customers</CardDescription>
          </div>
          <Button onClick={handleAddCustomer} className="whitespace-nowrap">
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, city, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/40">
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentCustomers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No customers found
                    </TableCell>
                  </TableRow>
                ) : (
                  currentCustomers.map((customer) => (
                    <TableRow key={customer.customer_id} className="hover:bg-accent/30">
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>
                        <Badge className={getTypeBadgeColor(customer.type)}>{customer.type}</Badge>
                      </TableCell>
                      <TableCell>{customer.city}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleViewCustomer(customer)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEditCustomer(customer)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteCustomer(customer)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1}–{Math.min(endIndex, filteredCustomers.length)} of{' '}
                {filteredCustomers.length}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* view modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>View complete customer information</DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-3">
              {Object.entries(selectedCustomer).map(([key, val]) =>
                key !== 'customer_id' ? (
                  <div key={key}>
                    <Label className="text-muted-foreground capitalize">{key}</Label>
                    <p className="font-medium">{val as string}</p>
                  </div>
                ) : null
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* add/edit modal */}
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Customer' : 'Add New Customer'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Update customer information' : 'Enter new customer details'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Customer name"
              />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'Retail' | 'Wholesale' | 'Corporate') =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="Wholesale">Wholesale</SelectItem>
                  <SelectItem value="Corporate">Corporate</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street address"
              />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="City"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="555-0000"
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="customer@example.com"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitForm}>
              {isEditing ? 'Update' : 'Add'} Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* delete dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{' '}
              <span className="font-semibold">{selectedCustomer?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Customers;
