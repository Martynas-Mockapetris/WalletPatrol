import axios from 'axios';
import { getToken } from '../utils/token'; // use helper

const API = axios.create({
  baseURL: 'http://localhost:4000/api'
});

// Interceptor: add JWT if present
API.interceptors.request.use((config) => {
  const token = getToken(); // read via helper
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;
