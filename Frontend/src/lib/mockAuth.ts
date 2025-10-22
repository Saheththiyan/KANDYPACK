import { API_URL } from "./config";

export interface LoginCredentials {
  email: string;
  password: string;
  role?: "Admin" | "Customer";
  rememberMe?: boolean;
}

export interface AuthUser {
  id: string;
  role: "Admin" | "Customer";
  email: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  type?: string | null;
}

export interface AuthSession extends AuthUser {
  token: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: AuthUser;
}

const STORAGE_KEY = "auth";

export const setAuthToken = (session: AuthSession) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
};

export const mergeAuthToken = (updates: Partial<AuthSession>) => {
  const existing = getAuthToken();
  if (!existing) return null;
  const merged: AuthSession = { ...existing };

  (Object.entries(updates) as [keyof AuthSession, AuthSession[keyof AuthSession]][]).forEach(
    ([key, value]) => {
      if (value !== undefined) {
        merged[key] = value;
      }
    }
  );

  setAuthToken(merged);
  return merged;
};

export const getAuthToken = (): AuthSession | null => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const clearAuthToken = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const isAuthenticated = () => {
  return getAuthToken() !== null;
};

export const signIn = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Login failed");
  }

  const data: AuthResponse = await response.json();
  return data;
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const calculatePasswordStrength = (
  password: string
): "weak" | "medium" | "strong" => {
  if (password.length < 8) return "weak";

  let score = 0;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score < 2) return "weak";
  if (score < 4) return "medium";
  return "strong";
};
