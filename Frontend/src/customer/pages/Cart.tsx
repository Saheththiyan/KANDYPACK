import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Minus, Trash2, Calendar, CreditCard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getCart, updateCartItem, removeFromCart, cities, CartItem } from '@/lib/api';
import { getAuthToken } from '@/lib/mockAuth';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format, addDays } from 'date-fns';
import { API_URL } from '@/lib/config';

// NEW: robust number coercion for prices
const toNumber = (val: unknown): number => {
  const n = typeof val === 'number' ? val : Number.parseFloat(String(val ?? '0'));
  return Number.isFinite(n) ? n : 0;
};

const CartItemRow = ({ item, onUpdate, onRemove }: {
  item: CartItem;
  onUpdate: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}) => {
  const unitPrice = toNumber(item.product.price);
  const lineTotal = unitPrice * item.quantity;

  return (
    <div className="flex items-center space-x-4 py-4 border-b last:border-b-0">
      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
        <img
          src={item.product.image}
          alt={item.product.name}
          className="w-full h-full object-cover rounded-lg"
          onError={(e) => {
            e.currentTarget.src = '/placeholder.svg';
          }}
        />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-medium truncate">{item.product.name}</h3>
        <p className="text-sm text-muted-foreground">SKU: {item.product.sku}</p>
        <p className="text-sm font-medium text-primary">Rs. {unitPrice.toFixed(2)}</p>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpdate(item.product.id, Math.max(0, item.quantity - 1))}
          className="h-8 w-8 p-0"
        >
          <Minus className="w-3 h-3" />
        </Button>
        <span className="w-8 text-center font-medium">{item.quantity}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onUpdate(item.product.id, item.quantity + 1)}
          className="h-8 w-8 p-0"
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>

      <div className="text-right">
        <p className="font-medium">Rs. {lineTotal.toFixed(2)}</p>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(item.product.id)}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

const CustomerCart = () => {
  const navigate = useNavigate();
  const auth = getAuthToken();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryDate, setDeliveryDate] = useState<Date>();
  const [formData, setFormData] = useState({
    name: auth?.name || '',
    email: auth?.email || '',
    phone: '',
    address: '',
    city: '',
    paymentMethod: 'cod'
  });

  useEffect(() => {
    setCart(getCart());

    const handleCartUpdate = () => {
      setCart(getCart());
    };

    window.addEventListener('cartUpdated', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, []);

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    updateCartItem(productId, quantity);
    setCart(getCart());
  };

  const handleRemoveItem = (productId: string) => {
    removeFromCart(productId);
    setCart(getCart());
    toast({
      title: 'Item removed',
      description: 'Item has been removed from your cart.',
    });
  };

  // UPDATED: use toNumber for robust subtotal calc
  const subtotal = cart.reduce((sum, item) => sum + (toNumber(item.product.price) * item.quantity), 0);
  const deliveryFee = 200;
  const total = subtotal + deliveryFee;

  const validateDeliveryDate = (date: Date) => {
    const minDate = addDays(new Date(), 7);
    return date >= minDate;
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast({
        title: 'Cart is empty',
        description: 'Add items to your cart before checking out.',
        variant: 'destructive',
      });
      return;
    }

    if (!deliveryDate || !validateDeliveryDate(deliveryDate)) {
      toast({
        title: 'Invalid delivery date',
        description: 'Please select a delivery date at least 7 days from today.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.name || !formData.email || !formData.phone || !formData.address || !formData.city) {
      toast({
        title: 'Required fields missing',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const order = await fetch(`${API_URL}/orders/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          name: auth.name,
          email: auth.email,
          customer_id: auth.id,
          phone: formData.phone,
          address: {
            street: formData.address,
            city: formData.city
          },

          required_date: format(deliveryDate, 'yyyy-MM-dd'),
          paymentMethod: formData.paymentMethod,
          items: cart.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: toNumber(item.product.price)
          })),
          totalAmount: total
        })
      }).then(res => {
        if (!res.ok) {
          throw new Error('Failed to place order');
        }


        toast({
          title: 'Order placed successfully!',
          description: `Your order ${order.id
            } has been placed.`,
        });
        return res.json();
      }).then(res => res.order);

      // Clear cart after successful order
      cart.forEach(item => removeFromCart(item.product.id));
      setCart([]);



      navigate(`/customer/orders/${order.id}`);
    } catch (error) {
      toast({
        title: 'Order failed',
        description: error instanceof Error ? error.message : 'Failed to place order.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Shopping Cart</h1>

        <Card>
          <CardContent className="py-12 text-center">
            <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground mb-4">
              Start shopping to add items to your cart.
            </p>
            <Button asChild>
              <Link to="/customer/products">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5" />
                <span>Cart Items ({cart.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {cart.map((item) => (
                  <CartItemRow
                    key={item.product.id}
                    item={item}
                    onUpdate={handleUpdateQuantity}
                    onRemove={handleRemoveItem}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Checkout Form */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rs. {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>Rs. {deliveryFee.toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span>Rs. {total.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Checkout Form */}
          <Card>
            <CardHeader>
              <CardTitle>Checkout Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCheckout} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Select value={formData.city} onValueChange={(value) => setFormData(prev => ({ ...prev, city: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map((city) => (
                        <SelectItem key={city} value={city}>{city}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Delivery Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !deliveryDate && "text-muted-foreground"
                        )}
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {deliveryDate ? format(deliveryDate, "PPP") : "Select delivery date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={deliveryDate}
                        onSelect={setDeliveryDate}
                        disabled={(date) =>
                          date < addDays(new Date(), 7) || date < new Date()
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-muted-foreground">
                    Minimum 7 days from today
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payment">Payment Method</Label>
                  <Select value={formData.paymentMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cod">Cash on Delivery</SelectItem>
                      <SelectItem value="card">Credit/Debit Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  {isLoading ? 'Placing Order...' : `Place Order - Rs.${total.toFixed(2)}`}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerCart;
