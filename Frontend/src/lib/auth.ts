export interface AuthData {
  token: string;
  role: string;
  email: string;
  name: string;
}

export const auth = {
  get(): AuthData | null {
    const authStr = localStorage.getItem('auth');
    if (!authStr) return null;
    try {
      return JSON.parse(authStr);
    } catch {
      return null;
    }
  },

  set(data: AuthData): void {
    localStorage.setItem('auth', JSON.stringify(data));
  },

  clear(): void {
    localStorage.removeItem('auth');
  },

  isAuthenticated(): boolean {
    return this.get() !== null;
  },

  isCustomer(): boolean {
    const authData = this.get();
    return authData?.role === 'Customer';
  },

  isAdmin(): boolean {
    const authData = this.get();
    return authData?.role === 'Admin';
  }
};
