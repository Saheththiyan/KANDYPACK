import { API_URL } from "./config";

export interface LoginCredentials {
  email: string;
  password: string;
  role?: 'Admin' | 'Customer';
  rememberMe?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    email: string;
    role: string;
    name: string;
  };
}

// Auth token management
export const setAuthToken = (token: string, role: string, email: string, name: string, id: string) => {
  const authData = { token, role, email, name, id };
  localStorage.setItem('auth', JSON.stringify(authData));
};

export const getAuthToken = () => {
  const auth = localStorage.getItem('auth');
  return auth ? JSON.parse(auth) : null;
};

export const clearAuthToken = () => {
  localStorage.removeItem('auth');
};

export const isAuthenticated = () => {
  return getAuthToken() !== null;
};

// Simulate network latency and potential errors
export const signIn = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed');
  }

  const data: AuthResponse = await response.json();
  return data;
};

// Validate email format
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Password strength calculation
export const calculatePasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  if (password.length < 8) return 'weak';
  
  let score = 0;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  
  if (score < 2) return 'weak';
  if (score < 4) return 'medium';
  return 'strong';
};