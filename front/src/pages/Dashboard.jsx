import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Handle logout - clear user and redirect to login
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.name}!</p>
      <p>Email: {user?.email}</p>
      <button onClick={handleLogout}>Logout</button>
      {/* TODO: Add transaction list here */}
      {/* TODO: Add calendar here */}
      {/* TODO: Add monthly analytics here */}
    </div>
  );
}
