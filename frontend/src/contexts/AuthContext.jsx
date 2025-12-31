import { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest, API_BASE_URL } from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const token = localStorage.getItem('token');

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await apiRequest('/api/me');

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        // Token invalid, clear it
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const { token } = await response.json();
    localStorage.setItem('token', token);

    // Fetch user info ONCE and both store it and return it
    const userResponse = await apiRequest('/api/me');
    if (userResponse.ok) {
      const userData = await userResponse.json();
      setUser(userData);
      return userData;
    }

    // If /api/me fails, clear token and throw error
    localStorage.removeItem('token');
    throw new Error('Failed to fetch user data');
  }

  async function signup(email, password) {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signup failed');
    }

    // After signup, log them in and return user data
    return await login(email, password);
  }

  function logout() {
    localStorage.removeItem('token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}