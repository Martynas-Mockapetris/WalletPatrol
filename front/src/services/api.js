import axios from 'axios';

// Create axios instance pointing to backend
const API = axios.create({
  baseURL: 'http://localhost:4000/api'
});

// Interceptor: Automatically add JWT to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
