// Dashboard: Main page orchestrating all transaction features
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import transactionService from '../services/transactionService';
import CalendarYear from '../components/CalendarYear';
import TransactionForm from '../components/TransactionForm';
import MonthlySummary from '../components/MonthlySummary';
import TransactionListSide from '../components/TransactionListSide.jsx';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Transaction list state
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [errorTx, setErrorTx] = useState(null);
  const [showTransactions, setShowTransactions] = useState(false);

  // Filter state
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [calendarYear, setCalendarYear] = useState(now.getFullYear());

  // Fetch transactions for selected month/year
  useEffect(() => {
    const fetchTx = async () => {
      setLoadingTx(true);
      setErrorTx(null);
      try {
        const { data } = await transactionService.getByMonth(month, year);
        setTransactions(data.transactions || []);
      } catch (err) {
        setErrorTx(err?.response?.data?.message || 'Failed to load transactions');
      } finally {
        setLoadingTx(false);
      }
    };

    fetchTx();
  }, [month, year]);

  // Handlers for child components
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddSuccess = (newTx) => {
    setTransactions((prev) => [newTx, ...prev]);
  };

  const handleUpdateTx = (updatedTx) => {
    setTransactions((prev) => prev.map((tx) => (tx._id === updatedTx._id ? updatedTx : tx)));
  };

  const handleDeleteTx = (id) => {
    setTransactions((prev) => prev.filter((tx) => tx._id !== id));
  };

  const handleCalendarMonthClick = (monthNum, yearNum) => {
    setMonth(monthNum);
    setYear(yearNum);
    setShowTransactions(true); // Show transactions when month selected
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Dashboard</h1>
            <p>
              Welcome, {user?.name}! ({user?.email})
            </p>
          </div>
          <div>
            <label style={{ marginRight: '1rem' }}>
              Calendar Year: <input type="number" value={calendarYear} onChange={(e) => setCalendarYear(Number(e.target.value))} min="1970" max="2100" step="1" style={{ width: '6rem' }} />
            </label>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>

      {/* Main Content: Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', padding: '1rem' }}>
        {/* Left: Calendar */}
        <div style={{ borderRight: '1px solid #eee', paddingRight: '1rem' }}>
          <CalendarYear year={calendarYear} onMonthSelect={handleCalendarMonthClick} />
        </div>

        {/* Right: Summary, Form, Transactions */}
        <div>
          <MonthlySummary transactions={transactions} />
          <TransactionForm onSuccess={handleAddSuccess} />

          {showTransactions && <TransactionListSide transactions={transactions} loading={loadingTx} error={errorTx} onUpdate={handleUpdateTx} onDelete={handleDeleteTx} />}
        </div>
      </div>
    </div>
  );
}
