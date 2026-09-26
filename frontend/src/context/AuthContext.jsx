import { useState } from 'react';
import { AuthContext } from './authContextDef';
import { login as apiLogin, register as apiRegister } from '../services/api';

export function AuthProvider({ children }) {
  // Initialize state directly from localStorage
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('inka_user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (err) {
      console.error('Failed to parse stored user:', err);
      localStorage.removeItem('inka_user');
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('inka_token') || null;
    } catch (err) {
      console.error('Failed to read stored token:', err);
      localStorage.removeItem('inka_token');
      return null;
    }
  });

  const [loading] = useState(false);

  // Login handler
  const login = async (credentials) => {
    const response = await apiLogin(credentials);
    const { token: receivedToken, user: receivedUser } = response.data;

    setToken(receivedToken);
    setUser(receivedUser);

    localStorage.setItem('inka_token', receivedToken);
    localStorage.setItem('inka_user', JSON.stringify(receivedUser));

    return response.data;
  };

  // Register handler
  const register = async (userData) => {
    const response = await apiRegister(userData);
    const { token: receivedToken, user: receivedUser } = response.data;

    setToken(receivedToken);
    setUser(receivedUser);

    localStorage.setItem('inka_token', receivedToken);
    localStorage.setItem('inka_user', JSON.stringify(receivedUser));

    return response.data;
  };

  // Logout handler
  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('inka_token');
    localStorage.removeItem('inka_user');
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user && token),
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
