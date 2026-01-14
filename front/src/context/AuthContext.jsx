import { createContext, useState, useContext } from 'react';
import authService from '../services/authService';

// Create context for authentication state
const AuthContext = createContext();

// Provider component - wraps entire app to provide auth state globally
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Logged-in user data
  const [loading, setLoading] = useState(false); // Loading state during requests
  const [error, setError] = useState(null); // Error messages

  // Register: Create new user account
  const register = async (name, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.register(name, email, password);
      setUser(data.user); // Store user in global state
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login: Authenticate existing user
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login(email, password);
      setUser(data.user); // Store user in global state
      return data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout: Clear user session
  const logout = () => {
    authService.logout(); // Remove token from localStorage
    setUser(null); // Clear user from state
  };

  // Check if user is authenticated
  const isAuthenticated = !!user;

  // Provide auth state and functions to all components
  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      register,
      login,
      logout,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook - components use this to access auth
// Usage: const { user, login, logout } = useAuth();
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};