import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Search, Plus, Eye, Pencil, Trash2, Users } from 'lucide-react';
import { API_URL } from "../../lib/config";
import { initDatabase } from '@/lib/db';
import {
  getAllCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
  searchCustomers,
} from '@/lib/queries';

const ITEMS_PER_PAGE = 10;

interface Customer {
  customer_id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  phone: string;
  email: string;
}

// async function fetchCustomers(): Promise<Customer[]> {
//   const response = await fetch("http://localhost:5000/admin/customers");
//   if (!response.ok) {
//     throw new Error("Failed to fetch customers");
//   }
//   return response.json();
// }

const Customers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  // const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  // const [isEditing, setIsEditing] = useState(false);
  // const [formData, setFormData] = useState({
  //   name: '',
  //   type: 'Retail' as 'Retail' | 'Wholesale' | 'Corporate',
  //   address: '',
  //   city: '',
  //   phone: '',
  //   email: '',
  // });
  const { toast } = useToast();

  async function fetchCustomers(): Promise<Customer[]> {
    const response = await fetch(`${API_URL}/admin/customers`);
    if (!response.ok) {
      throw new Error("Failed to fetch customers");
    }
    return response.json();
  }

  const searchLocalCustomers = (term: string, customers: Customer[]): Customer[] => {
    const lowerTerm = term.toLowerCase().trim();
    if (!lowerTerm) return customers;

    return customers.filter(c =>
      c.name.toLowerCase().includes(lowerTerm) ||
      c.type.toLowerCase().includes(lowerTerm) ||
      c.city.toLowerCase().includes(lowerTerm) ||
      c.email.toLowerCase().includes(lowerTerm)
    );
  };

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const results = searchLocalCustomers(searchTerm, customers);
      setFilteredCustomers(results);
    }
    setCurrentPage(1);
  }, [searchTerm, customers]);
  
  // useEffect(() => {
  //   loadCustomers();
  // }, []);

  // const loadCustomers = async () => {
  //   try {
  //     setLoading(true);
  //     const data = await fetchCustomers();
  //     setCustomers(data);
  //     setFilteredCustomers(data);
  //   } catch (err) {
  //     console.error(err);
  //     toast({
  //       title: 'Error',
  //       description: 'Failed to load customers',
  //       variant: 'destructive',
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const confirmDelete = async () => {
  //   if (!selectedCustomer) return;

  //   try {
  //     // If you have deleteCustomer in '@/lib/queries' that performs the API call:
  //     // await deleteCustomer(selectedCustomer.);

  //     // Or call the API directly:
  //     const res = await fetch(`http://localhost:5000/admin/customers/${selectedCustomer.}`, {
  //       method: 'DELETE',
  //     });
  //     if (!res.ok) throw new Error('Failed to delete customer');
  //     // reload the list
  //     await loadCustomers();

  //     toast({
  //       title: 'Success',
  //       description: 'Customer deleted successfully',
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     toast({
  //       title: 'Error',
  //       description: 'Failed to delete customer',
  //       variant: 'destructive',
  //     });
  //   } finally {
  //     setIsDeleteDialogOpen(false);
  //     setSelectedCustomer(null);
  //   }
  // };

  const confirmDelete = async () => {
    if (selectedCustomer) {
      try {
        const response = await fetch(`http://localhost:5000/admin/customers/${selectedCustomer.customer_id}`, {
          method: "DELETE",
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.message || "Failed to delete customer");
        }
        toast({
          title: "Success",
          description: "Customer deleted successfully",
        });
      const updatedCustomers = await fetchCustomers();
      setCustomers(updatedCustomers);
      setFilteredCustomers(updatedCustomers);
      } catch (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsDeleteDialogOpen(false);
        setSelectedCustomer(null);
      }
    }
  };


  // useEffect(() => {
  //   if (searchTerm.trim() === '') {
  //     setFilteredCustomers(customers);
  //   } else {
  //     const results = searchCustomers(searchTerm);
  //     setFilteredCustomers(results);
  //   }
  //   setCurrentPage(1);
  // }, [searchTerm, customers]);

  // const loadCustomers = async () => {
  //   try {
  //     setLoading(true);
  //     await initDatabase();
  //     const data = getAllCustomers();
  //     setCustomers(data);
  //     setFilteredCustomers(data);
  //   } catch (error) {
  //     toast({
  //       title: 'Error',
  //       description: 'Failed to load customers',
  //       variant: 'destructive',
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  useEffect(() => {
    fetchCustomers()
      .then(data => setCustomers(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // const handleAddCustomer = () => {
  //   setFormData({
  //     name: '',
  //     type: 'Retail',
  //     address: '',
  //     city: '',
  //     phone: '',
  //     email: '',
  //   });
  //   setIsEditing(false);
  //   setIsFormModalOpen(true);
  // };

  // const handleEditCustomer = (customer: Customer) => {
  //   setSelectedCustomer(customer);
  //   setFormData({
  //     name: customer.name,
  //     type: customer.type,
  //     address: customer.address,
  //     city: customer.city,
  //     phone: customer.phone,
  //     email: customer.email,
  //   });
  //   setIsEditing(true);
  //   setIsFormModalOpen(true);
  // };

  const handleViewCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsViewModalOpen(true);
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteDialogOpen(true);
  };

  // const confirmDelete = () => {
  //   if (selectedCustomer) {
  //     try {
  //       deleteCustomer(selectedCustomer.customerId);
  //       loadCustomers();
  //       toast({
  //         title: 'Success',
  //         description: 'Customer deleted successfully',
  //       });
  //     } catch (error) {
  //       toast({
  //         title: 'Error',
  //         description: 'Failed to delete customer',
  //         variant: 'destructive',
  //       });
  //     }
  //     setIsDeleteDialogOpen(false);
  //     setSelectedCustomer(null);
  //   }
  // };

  // const handleSubmitForm = () => {
    // try {
      // if (isEditing && selectedCustomer) {
      //   // updateCustomer(selectedCustomer.customerId, formData);
      //   toast({
      //     title: 'Success',
      //     description: 'Customer updated successfully',
      //   });
      // } else {
      //   addCustomer(formData);
      //   toast({
      //     title: 'Success',
      //     description: 'Customer added successfully',
      //   });
      // }
      // loadCustomers();
      // setIsFormModalOpen(false);
      // setSelectedCustomer(null);
    // } catch (error) {
      // toast({
      //   title: 'Error',
      //   description: `Failed to ${isEditing ? 'update' : 'add'} customer`,
      //   variant: 'destructive',
      // });
    // }
  // };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Customer Management</h2>
        <p className="text-muted-foreground">
          View customer information
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retail Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.filter((c) => c.type === 'Retail').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Corporate Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.filter((c) => c.type === 'Corporate').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Customer List</CardTitle>
              <CardDescription>
                View, search, and manage all customers
              </CardDescription>
            </div>
            {/* <Button onClick={handleAddCustomer}>
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button> */}
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex items-center mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, type or city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
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
                    <TableRow key={customer.customer_id}>
                      <TableCell className="font-medium">{customer.name}</TableCell>
                      <TableCell>
                        <Badge className={getTypeBadgeColor(customer.type)}>
                          {customer.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{customer.city}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewCustomer(customer)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {/* <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditCustomer(customer)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button> */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCustomer(customer)}
                          >
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredCustomers.length)} of{' '}
                {filteredCustomers.length} customers
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

      {/* View Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              View complete customer information
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-4">
              <div>
                <Label className="text-muted-foreground">Name</Label>
                <p className="font-medium">{selectedCustomer.name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Type</Label>
                <p>
                  <Badge className={getTypeBadgeColor(selectedCustomer.type)}>
                    {selectedCustomer.type}
                  </Badge>
                </p>
              </div>
              <div>
                <Label className="text-muted-foreground">Address</Label>
                <p className="font-medium">{selectedCustomer.address}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">City</Label>
                <p className="font-medium">{selectedCustomer.city}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Phone</Label>
                <p className="font-medium">{selectedCustomer.phone}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Email</Label>
                <p className="font-medium">{selectedCustomer.email}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Modal
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
                  <SelectValue />
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
      </Dialog> */}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the customer{' '}
              <span className="font-semibold">{selectedCustomer?.name}</span>. This action cannot
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

export default Customers;
