import API from './api';
import { setToken, clearToken } from '../utils/token';

// Service for handling user authentication (register, login, logout)
const authService = {
  // Register: Create new user account
  // Takes: name, email, password from user input
  // Returns: User data + JWT token
  register: async (name, email, password) => {
    try {
      const response = await API.post('/auth/register', {
        name,
        email,
        password
      });

      // If backend returns token, save it to localStorage
      // Interceptor will use it for future requests
      if (response.data.token) {
        setToken(response.data.token);
      }

      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Register failed';
    }
  },

  // Login: Authenticate existing user
  // Takes: email, password from user input
  // Returns: User data + JWT token
  login: async (email, password) => {
    try {
      const response = await API.post('/auth/login', {
        email,
        password
      });

      // If backend returns token, save it to localStorage
      if (response.data.token) {
        setToken(response.data.token);
      }

      return response.data;
    } catch (error) {
      throw error.response?.data?.message || 'Login failed';
    }
  },

  me: async () => API.get('/auth/me'),

  // Logout: Remove user session
  // Removes token from localStorage - user will be logged out
  logout: () => {
    clearToken();
  }
};

export default authService;
