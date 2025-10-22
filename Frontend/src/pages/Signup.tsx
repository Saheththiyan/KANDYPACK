import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { BrandPane } from '@/components/BrandPane';
import { DarkModeToggle } from '@/components/DarkModeToggle';
import { SystemStatus } from '@/components/SystemStatus';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { calculatePasswordStrength, validateEmail } from '@/lib/mockAuth';
import { API_URL } from '@/lib/config';
import loginBackground from '@/assets/login-background.jpg';

const customerTypes = ['Retail', 'Wholesale', 'Distributor'];

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    address: '',
    city: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordStrength = formData.password
    ? calculatePasswordStrength(formData.password)
    : null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required.';
    }

    if (!formData.type) {
      newErrors.type = 'Customer type is required.';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required.';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required.';
    } else if (!/^[0-9+\-\s]{7,}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Enter a valid phone number.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!validateEmail(formData.email.trim())) {
      newErrors.email = 'Enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak':
        return 'bg-danger';
      case 'medium':
        return 'bg-warning';
      case 'strong':
        return 'bg-success';
      default:
        return 'bg-muted';
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setServerError('');

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        type: formData.type,
        address: formData.address.trim(),
        city: formData.city.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        password: formData.password,
      };

      const response = await fetch(`${API_URL}/api/auth/customer-register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      let data: any = {};
      try {
        data = await response.json();
      } catch (readError) {
        console.error('Failed to read registration response', readError);
      }

      if (!response.ok || !data.success) {
        setServerError(data.message || 'Unable to create account. Please try again.');
        return;
      }

      toast({
        title: 'Account created',
        description: 'Your customer account is ready. You can sign in now.',
      });
      navigate('/login');
    } catch (error) {
      setServerError(
        error instanceof Error ? error.message : 'An unexpected error occurred.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col lg:flex-row relative"
      style={{
        backgroundImage: `url(${loginBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-background/80 dark:bg-background/90 backdrop-blur-sm"></div>

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row w-full">
        <div className="lg:hidden flex justify-between items-center p-4 border-b bg-card/50 backdrop-blur-md">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">K</span>
            </div>
            <span className="font-semibold text-foreground">Kandypack</span>
          </div>
          <DarkModeToggle />
        </div>

        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5">
          <div className="relative w-full">
            <BrandPane />
            <div className="absolute top-6 right-6">
              <DarkModeToggle />
            </div>
          </div>
        </div>

        <div className="flex-1 lg:w-1/2 xl:w-2/5 flex flex-col">
          <div className="flex-1 flex items-center justify-center p-4 lg:p-8">
            <div className="w-full max-w-xl bg-card/70 backdrop-blur-md rounded-2xl border shadow-lg p-8">
              <div className="mb-6 text-center">
                <h2 className="text-3xl font-bold text-foreground mb-2">Customer Sign up</h2>
                <p className="text-muted-foreground">
                  Create your Kandypack customer account to access orders and deliveries.
                </p>
              </div>

              {serverError && (
                <Alert className="mb-6 border-danger/20 bg-danger/5">
                  <AlertCircle className="h-4 w-4 text-danger" />
                  <AlertDescription className="text-danger">{serverError}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Customer name</Label>
                    <Input
                      id="name"
                      placeholder="Green Grocers Pvt Ltd"
                      value={formData.name}
                      onChange={(event) =>
                        setFormData((prev) => ({ ...prev, name: event.target.value }))
                      }
                      className={errors.name ? 'border-danger focus-visible:ring-danger' : ''}
                    />
                    {errors.name && <p className="text-sm text-danger">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="type">Customer type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger
                        id="type"
                        className={
                          errors.type
                            ? 'border-danger focus-visible:ring-danger focus-visible:border-danger'
                            : ''
                        }
                      >
                        <SelectValue placeholder="Select customer type" />
                      </SelectTrigger>
                      <SelectContent>
                        {customerTypes.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.type && <p className="text-sm text-danger">{errors.type}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Registered address</Label>
                  <Textarea
                    id="address"
                    placeholder="No. 10, Main Street, Kandy"
                    value={formData.address}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, address: event.target.value }))
                    }
                    className={errors.address ? 'border-danger focus-visible:ring-danger' : ''}
                  />
                  {errors.address && <p className="text-sm text-danger">{errors.address}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="Colombo"
                      value={formData.city}
                      onChange={(event) =>
                        setFormData((prev) => ({ ...prev, city: event.target.value }))
                      }
                      className={errors.city ? 'border-danger focus-visible:ring-danger' : ''}
                    />
                    {errors.city && <p className="text-sm text-danger">{errors.city}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Contact number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+94 77 123 4567"
                      value={formData.phone}
                      onChange={(event) =>
                        setFormData((prev) => ({ ...prev, phone: event.target.value }))
                      }
                      className={errors.phone ? 'border-danger focus-visible:ring-danger' : ''}
                    />
                    {errors.phone && <p className="text-sm text-danger">{errors.phone}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Work email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="orders@yourcompany.lk"
                    value={formData.email}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, email: event.target.value }))
                    }
                    className={errors.email ? 'border-danger focus-visible:ring-danger' : ''}
                  />
                  {errors.email && <p className="text-sm text-danger">{errors.email}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={(event) =>
                          setFormData((prev) => ({ ...prev, password: event.target.value }))
                        }
                        className={`pr-10 ${errors.password ? 'border-danger focus-visible:ring-danger' : ''}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowPassword((prev) => !prev)}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>

                    {formData.password && (
                      <div className="space-y-1">
                        <div className="flex space-x-1">
                          <div className={`h-1 flex-1 rounded ${getPasswordStrengthColor()}`} />
                          <div
                            className={`h-1 flex-1 rounded ${
                              passwordStrength !== 'weak' ? getPasswordStrengthColor() : 'bg-muted'
                            }`}
                          />
                          <div
                            className={`h-1 flex-1 rounded ${
                              passwordStrength === 'strong' ? getPasswordStrengthColor() : 'bg-muted'
                            }`}
                          />
                        </div>
                        <p
                          className={`text-xs font-medium ${
                            passwordStrength === 'weak'
                              ? 'text-danger'
                              : passwordStrength === 'medium'
                              ? 'text-warning'
                              : 'text-success'
                          }`}
                        >
                          Password strength: {passwordStrength}
                        </p>
                      </div>
                    )}

                    {errors.password && <p className="text-sm text-danger">{errors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Repeat your password"
                        value={formData.confirmPassword}
                        onChange={(event) =>
                          setFormData((prev) => ({
                            ...prev,
                            confirmPassword: event.target.value,
                          }))
                        }
                        className={`pr-10 ${errors.confirmPassword ? 'border-danger focus-visible:ring-danger' : ''}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-danger">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create account'
                  )}
                </Button>

                <div className="text-sm text-center text-muted-foreground">
                  Already have access?{' '}
                  <button
                    type="button"
                    className="text-primary hover:text-primary-hover underline underline-offset-4"
                    onClick={() => navigate('/login')}
                  >
                    Sign in
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="p-6 border-t bg-card/50 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-4">
              <SystemStatus />
              <div className="text-xs text-muted-foreground">
                © 2024 Kandypack Logistics. Secure platform.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
