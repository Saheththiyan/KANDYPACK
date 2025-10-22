import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { API_URL } from '@/lib/config';
import { getAuthToken, mergeAuthToken } from '@/lib/mockAuth';
import { cities } from '@/lib/api';

type ProfileState = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  type: string;
};

const defaultProfile: ProfileState = {
  name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  type: '',
};

const ProfilePage = () => {
  const auth = getAuthToken();
  const [profile, setProfile] = useState<ProfileState>(defaultProfile);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      if (!auth?.token) return;

      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/api/auth/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
          },
        });

        const payload = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(payload.message || 'Failed to load profile');
        }

        const data = payload.user;
        setProfile({
          name: data.name ?? '',
          email: data.email ?? '',
          phone: data.phone ?? '',
          address: data.address ?? '',
          city: data.city ?? '',
          type: data.type ?? '',
        });
      } catch (error) {
        console.error('Failed to load profile:', error);
        toast({
          title: 'Error loading profile',
          description: error instanceof Error ? error.message : 'Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [auth?.token]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!auth?.token) return;

    setIsSaving(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          address: profile.address,
          city: profile.city,
          type: profile.type,
        }),
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'Failed to update profile');
      }

      const data = payload.user;
      setProfile({
        name: data.name ?? '',
        email: data.email ?? '',
        phone: data.phone ?? '',
        address: data.address ?? '',
        city: data.city ?? '',
        type: data.type ?? '',
      });

      mergeAuthToken({
        name: data.name ?? undefined,
        phone: data.phone ?? undefined,
        address: data.address ?? undefined,
        city: data.city ?? undefined,
        type: data.type ?? undefined,
      });

      toast({
        title: 'Profile updated',
        description: 'Your profile information has been saved.',
      });
    } catch (error) {
      console.error('Profile update failed:', error);
      toast({
        title: 'Update failed',
        description: error instanceof Error ? error.message : 'Unable to save profile.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold">My Profile</h1>
        <p className="text-muted-foreground">
          Keep your contact information up to date to ensure smooth deliveries.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
          <CardDescription>Edit your personal information.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(event) =>
                    setProfile((prev) => ({ ...prev, name: event.target.value }))
                  }
                  placeholder="Your full name"
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                />
                <p className="text-xs text-muted-foreground">
                  Contact support to change your email address.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(event) =>
                    setProfile((prev) => ({ ...prev, phone: event.target.value }))
                  }
                  placeholder="Contact number"
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Account Type</Label>
                <Select
                  value={profile.type}
                  onValueChange={(value) => setProfile((prev) => ({ ...prev, type: value }))}
                  disabled={isLoading}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Retail">Retail</SelectItem>
                    <SelectItem value="Wholesale">Wholesale</SelectItem>
                    <SelectItem value="Corporate">Corporate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={profile.address}
                onChange={(event) =>
                  setProfile((prev) => ({ ...prev, address: event.target.value }))
                }
                placeholder="Street address"
                disabled={isLoading}
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Select
                  value={profile.city}
                  onValueChange={(value) => setProfile((prev) => ({ ...prev, city: value }))}
                  disabled={isLoading}
                >
                  <SelectTrigger id="city">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving || isLoading}>
                {isSaving ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
