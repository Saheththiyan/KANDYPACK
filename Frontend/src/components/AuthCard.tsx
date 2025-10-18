import React, { useState } from 'react';
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { validateEmail, calculatePasswordStrength, setAuthToken, type LoginCredentials } from '@/lib/mockAuth';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '@/lib/config';

export const AuthCard = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginCredentials>({
    email: '',
    password: '',
    role: undefined,
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMessage, setErrorMessage] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');

  const passwordStrength = formData.password ? calculatePasswordStrength(formData.password) : null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required.';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      }).then(res => res.json());

      if (response.success && response.user && response.token) {
        // Store auth token and user data
        setAuthToken(response.token, response.user.role, response.user.email, response.user.name);

        // Route based on role
        if (response.user.role === 'Customer') {
          navigate('/customer');
        } else if (response.user.role === 'Admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }

        toast({
          title: "Sign in successful",
          description: `Welcome back, ${response.user.name}!`,
        });
      } else {
        setErrorMessage(response.message);
      }
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FASubmit = () => {
    if (twoFACode === '123456') {
      setShow2FA(false);
      navigate('/dashboard');
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak': return 'bg-danger';
      case 'medium': return 'bg-warning';
      case 'strong': return 'bg-success';
      default: return 'bg-muted';
    }
  };

  return (
    <>
      <div className="w-full max-w-md mx-auto p-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-2">Sign in</h2>
          <p className="text-muted-foreground">Access your Kandypack dashboard</p>
        </div>

        {errorMessage && (
          <Alert className="mb-6 border-danger/20 bg-danger/5" data-testid="error-banner">
            <AlertCircle className="h-4 w-4 text-danger" />
            <AlertDescription className="text-danger">
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              Email address
            </Label>
            <Input
              id="email"
              type="email"
              data-testid="email-input"
              placeholder="admin@kandypack.lk"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              aria-describedby={errors.email ? "email-error" : undefined}
              className={errors.email ? 'border-danger focus-visible:ring-danger' : ''}
            />
            {errors.email && (
              <p id="email-error" className="text-sm text-danger">{errors.email}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                data-testid="password-input"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                aria-describedby={errors.password ? "password-error" : undefined}
                className={`pr-10 ${errors.password ? 'border-danger focus-visible:ring-danger' : ''}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="space-y-1">
                <div className="flex space-x-1">
                  <div className={`h-1 flex-1 rounded ${getPasswordStrengthColor()}`} />
                  <div className={`h-1 flex-1 rounded ${passwordStrength !== 'weak' ? getPasswordStrengthColor() : 'bg-muted'}`} />
                  <div className={`h-1 flex-1 rounded ${passwordStrength === 'strong' ? getPasswordStrengthColor() : 'bg-muted'}`} />
                </div>
                <p className={`text-xs font-medium ${passwordStrength === 'weak' ? 'text-danger' :
                    passwordStrength === 'medium' ? 'text-warning' : 'text-success'
                  }`}>
                  Password strength: {passwordStrength}
                </p>
              </div>
            )}

            {errors.password && (
              <p id="password-error" className="text-sm text-danger">{errors.password}</p>
            )}
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Role <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Select
              value={formData.role || ''}
              onValueChange={(value: 'Admin' | 'Customer') =>
                setFormData(prev => ({ ...prev, role: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Admin">Administrator</SelectItem>
                <SelectItem value="Customer">Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Remember Me */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="remember"
              data-testid="remember-checkbox"
              checked={formData.rememberMe}
              onCheckedChange={(checked) =>
                setFormData(prev => ({ ...prev, rememberMe: checked === true }))
              }
            />
            <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
              Remember me for 30 days
            </Label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            data-testid="signin-button"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>

          {/* Secondary Links */}
          <div className="flex flex-col sm:flex-row sm:justify-between gap-3 text-sm">
            <button
              type="button"
              className="text-primary hover:text-primary-hover underline underline-offset-4"
            >
              Forgot password?
            </button>
            <button
              type="button"
              className="text-primary hover:text-primary-hover underline underline-offset-4"
            >
              Request access
            </button>
          </div>
        </form>

        {/* Demo Credentials Helper */}
        <div className="mt-8 p-4 bg-muted/50 rounded-lg border">
          <p className="text-xs font-medium text-muted-foreground mb-2">Demo Credentials:</p>
          <div className="text-xs space-y-1">
            <p><span className="font-medium">Admin 1:</span> admin1@kandypack.com / hashedpass1</p>
            <p><span className="font-medium">Admin 2:</span> admin2@kandypack.com / hashedpass2</p>
            <p><span className="font-medium">Admin 3:</span> admin3@kandypack.com / hashedpass3</p>
            <p><span className="font-medium">Customer:</span> customer@kandypack.lk / Password1!</p>
          </div>
        </div>
      </div>

      {/* 2FA Modal */}
      <Dialog open={show2FA} onOpenChange={setShow2FA}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <span>Two-Factor Authentication</span>
            </DialogTitle>
            <DialogDescription>
              Enter the 6-digit code from your authenticator app.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="000000"
              value={twoFACode}
              onChange={(e) => setTwoFACode(e.target.value)}
              maxLength={6}
              className="text-center text-lg tracking-widest"
            />
            <Button onClick={handle2FASubmit} className="w-full" disabled={twoFACode.length !== 6}>
              Verify Code
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Demo code: 123456
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};