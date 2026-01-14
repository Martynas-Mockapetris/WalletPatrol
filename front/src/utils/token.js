// Read token from localStorage
export const getToken = () => localStorage.getItem('token');

// Save token to localStorage
export const setToken = (token) => localStorage.setItem('token', token);

// Remove token from localStorage
export const clearToken = () => localStorage.removeItem('token');
