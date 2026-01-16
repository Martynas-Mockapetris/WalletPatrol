// Dashboard: Main page orchestrating all transaction features
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import transactionService from '../services/transactionService';
import TransactionForm from '../components/TransactionForm';
import MonthlySummary from '../components/MonthlySummary';
import TransactionListSide from '../components/TransactionListSide.jsx';
import SingleMonthCalendar from '../components/SingleMonthCalendar';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Transaction list state
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [errorTx, setErrorTx] = useState(null);

  // Filter state
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const MONTH_LABELS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div>
            <h1>Dashboard</h1>
            <p>
              Welcome, {user?.name}! ({user?.email})
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <label>
              Month:{' '}
              <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                {MONTH_LABELS.map((label, idx) => (
                  <option key={label} value={idx + 1}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Year:{' '}
              <input
                type="number"
                value={year}
                onChange={(e) => {
                  const y = Number(e.target.value);
                  setYear(y);
                }}
                min="1970"
                max="2100"
                step="1"
                style={{ width: '6rem' }}
              />
            </label>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </div>
      </div>

      {/* Main Content: Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', padding: '1rem' }}>
        {/* Left: Calendar */}
        <div style={{ borderRight: '1px solid #eee', paddingRight: '1rem' }}>
          <h2>Calendar</h2>
          <SingleMonthCalendar
            year={year}
            month={month}
            monthLabel={MONTH_LABELS[month - 1]}
            txByDay={transactions.reduce((acc, tx) => {
              const d = new Date(tx.date);
              const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
              acc[iso] = (acc[iso] || 0) + 1;
              return acc;
            }, {})}
            onDaySelect={(iso) => {
              // Optional: filter to that specific day later; for now just a placeholder
              console.log('Day clicked:', iso);
            }}
          />
        </div>

        {/* Right: Summary, Form, Transactions */}
        <div>
          <MonthlySummary transactions={transactions} />
          <TransactionForm onSuccess={handleAddSuccess} />
          <TransactionListSide transactions={transactions} loading={loadingTx} error={errorTx} onUpdate={handleUpdateTx} onDelete={handleDeleteTx} />{' '}
        </div>
      </div>
    </div>
  );
}
