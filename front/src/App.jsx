import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';

// Protected route - only logged in users can access
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, initializing } = useAuth();

  // Wait for token check to finish
  if (initializing) {
    return <div>Loading...</div>; // Show loading while checking token
  }

  // If not authenticated after check, redirect
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        {/* Default - redirect to login */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}
