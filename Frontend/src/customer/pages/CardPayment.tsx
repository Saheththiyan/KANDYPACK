import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CreditCard, ShieldCheck, ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { getAuthToken, mergeAuthToken } from '@/lib/mockAuth';
import { clearCart, type CartItem } from '@/lib/api';
import { API_URL } from '@/lib/config';
import { format } from 'date-fns';

type PaymentLocationState = {
  order: {
    customer_id: string;
    required_date: string;
    paymentMethod: string;
    totalAmount: number;
    contact?: {
      name?: string;
      phone?: string;
      address?: string;
      city?: string;
    };
    items: {
      productId: string;
      quantity: number;
      price: number;
    }[];
  };
  customer: {
    name: string;
    email: string;
  };
  cart: CartItem[];
  summary: {
    subtotal: number;
    total: number;
    deliveryDate: string | null;
  };
};

const maskCardNumber = (value: string) =>
  value.replace(/\s+/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim();

const CustomerCardPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuthToken();
  const state = location.state as PaymentLocationState | null;

  const [cardName, setCardName] = useState(state?.customer.name ?? '');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!state?.order) {
      toast({
        title: 'Missing order details',
        description: 'Please start the checkout again.',
        variant: 'destructive',
      });
      navigate('/customer/cart', { replace: true });
    }
  }, [state, navigate]);

  const deliveryDateDisplay = useMemo(() => {
    if (!state?.summary.deliveryDate) return null;
    try {
      return format(new Date(state.summary.deliveryDate), 'PPP');
    } catch {
      return null;
    }
  }, [state?.summary.deliveryDate]);

  const handlePayment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!state?.order || !auth?.token) return;

    if (cardNumber.replace(/\s+/g, '').length < 12 || !expiry || cvv.length < 3) {
      toast({
        title: 'Incomplete card details',
        description: 'Please provide a valid card number, expiry date, and CVV.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          ...state.order,
          paymentMethod: 'card',
          contact: state.order.contact,
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'Payment failed');
      }

      const createdOrder = payload.order;
      const orderId = createdOrder?.order_id || createdOrder?.id;

      clearCart();
      mergeAuthToken({
        name: state.order.contact?.name ?? undefined,
        phone: state.order.contact?.phone ?? undefined,
        address: state.order.contact?.address ?? undefined,
        city: state.order.contact?.city ?? undefined,
      });

      toast({
        title: 'Payment successful',
        description: 'Your card has been charged and the order confirmed.',
      });

      if (orderId) {
        navigate(`/customer/orders/${orderId}`, { replace: true });
      } else {
        navigate('/customer/orders', { replace: true });
      }
    } catch (error) {
      toast({
        title: 'Payment failed',
        description: error instanceof Error ? error.message : 'Unable to process payment.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!state?.order) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/customer/cart">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to cart
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Card Payment
            </CardTitle>
            <CardDescription>Securely complete your payment to place the order.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePayment} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="card-name">Name on card</Label>
                <Input
                  id="card-name"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="card-number">Card number</Label>
                <Input
                  id="card-number"
                  inputMode="numeric"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(maskCardNumber(e.target.value))}
                  placeholder="1234 5678 9012 3456"
                  required
                  maxLength={19}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    inputMode="numeric"
                    maxLength={4}
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing payment...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Pay Rs.{state.summary.total.toFixed(2)}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {state.cart.map((item) => (
                  <div key={item.product.id} className="flex justify-between text-sm">
                    <span>{item.product.name}</span>
                    <span>{item.quantity} × Rs.{Number(item.product.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>Rs.{state.summary.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>Rs.{state.summary.total.toFixed(2)}</span>
              </div>
              {deliveryDateDisplay && (
                <p className="text-xs text-muted-foreground">
                  Delivery scheduled for <strong>{deliveryDateDisplay}</strong>
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>Name:</strong> {state.order.contact?.name}</p>
              <p><strong>Email:</strong> {state.customer.email}</p>
              <p><strong>Phone:</strong> {state.order.contact?.phone}</p>
              <p><strong>Address:</strong> {state.order.contact?.address}</p>
              <p><strong>City:</strong> {state.order.contact?.city}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerCardPayment;
