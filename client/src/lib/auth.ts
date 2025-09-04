// JWT Token Management Utilities

const TOKEN_KEY = 'dogtor_auth_token';

export interface AuthUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  pet_name?: string;
  pet_breed?: string;
  pet_birth_month?: number;
  pet_birth_year?: number;
  pet_gender?: string;
  auth_method: 'google' | 'email' | 'demo';
  isDemo?: boolean;
}

// Token storage functions
export const setAuthToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// Create authenticated fetch function
export const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = getAuthToken();
  const apiUrl = process.env.REACT_APP_API_BASE || '';
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(`${apiUrl}${url}`, {
    ...options,
    headers,
  });
};

// Check if user is authenticated and get user data
export const checkAuth = async (): Promise<AuthUser | null> => {
  const token = getAuthToken();
  
  if (!token) {
    return null;
  }

  try {
    const response = await authFetch('/api/auth/user');
    
    if (response.ok) {
      return await response.json();
    } else {
      // Token is invalid, remove it
      removeAuthToken();
      return null;
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    return null;
  }
};

// Logout function
export const logout = async (): Promise<void> => {
  try {
    // Call backend logout endpoint (optional)
    await authFetch('/auth/logout', { method: 'POST' });
  } catch (error) {
    // Continue even if backend call fails
    console.warn('Backend logout failed:', error);
  } finally {
    // Always remove token locally
    removeAuthToken();
  }
};

// Parse token from URL (for OAuth redirects)
export const handleAuthRedirect = (): boolean => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  if (token) {
    setAuthToken(token);
    // Clean URL
    window.history.replaceState({}, document.title, window.location.pathname);
    return true;
  }
  
  return false;
};