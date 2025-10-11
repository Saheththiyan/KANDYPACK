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

// Mock credentials for demo
const validCredentials = [
  {
    email: 'admin1@kandypack.com',
    password: 'hashedpass1',
    role: 'Admin',
    name: 'Admin User 1'
  },
  {
    email: 'admin2@kandypack.com',
    password: 'hashedpass2',
    role: 'Admin',
    name: 'Admin User 2'
  },
  {
    email: 'admin3@kandypack.com',
    password: 'hashedpass3',
    role: 'Admin',
    name: 'Admin User 3'
  },
  {
    email: 'customer@kandypack.lk', 
    password: 'Password1!',
    role: 'Customer',
    name: 'Kandypack Customer'
  }
];

// Auth token management
export const setAuthToken = (token: string, role: string, email: string, name: string) => {
  const authData = { token, role, email, name };
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
export const mockSignIn = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  // Simulate network delay (800-1200ms)
  const delay = Math.random() * 400 + 800;
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // 10% chance of network error simulation
  if (Math.random() < 0.1) {
    throw new Error("We're having trouble signing you in. Please try again.");
  }

  // Validate credentials
  const user = validCredentials.find(
    cred => cred.email === credentials.email && cred.password === credentials.password
  );

  if (!user) {
    return {
      success: false,
      message: 'The email or password you entered is incorrect.'
    };
  }

  // Generate mock token
  const token = `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    success: true,
    message: 'Sign in successful',
    token,
    user: {
      email: user.email,
      role: credentials.role || user.role,
      name: user.name
    }
  };
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