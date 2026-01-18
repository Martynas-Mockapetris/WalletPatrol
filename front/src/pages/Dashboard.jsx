// Dashboard: Main page orchestrating all transaction features
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import transactionService from '../services/transactionService';
import TransactionForm from '../components/TransactionForm';
import MonthlySummary from '../components/MonthlySummary';
import TransactionListSide from '../components/TransactionListSide.jsx';
import SingleMonthCalendar from '../components/SingleMonthCalendar';
import SavingsList from '../components/SavingsList';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Totals state
  const [allTotals, setAllTotals] = useState({ income: 0, expense: 0, net: 0 });

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

  // Calculate all-time totals on mount
  useEffect(() => {
    const fetchAllTotals = async () => {
      try {
        const { data } = await transactionService.getAll();
        const totals = data.transactions.reduce(
          (acc, tx) => {
            if (tx.type === 'income') acc.income += tx.amount;
            else if (tx.type === 'expense') acc.expense += tx.amount;
            return acc;
          },
          { income: 0, expense: 0, net: 0 }
        );
        totals.net = totals.income - totals.expense;
        setAllTotals(totals);
      } catch (err) {
        console.error('Failed to load all-time totals', err);
      }
    };
    fetchAllTotals();
  }, []);

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
      <div
        style={{
          padding: 'var(--spacing-lg)',
          borderBottom: '1px solid var(--color-border)',
          background: 'var(--color-card)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          {/* Row 1: Welcome + Logout */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 'var(--spacing-md)'
            }}
          >
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
              Welcome, {user?.name}! ({user?.email})
            </p>
            <button onClick={handleLogout} className="btn btn-danger">
              Logout
            </button>
          </div>

          {/* Row 2: Dashboard title + Month/Year selectors */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <h1 style={{ margin: 0 }}>Dashboard</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <label style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                Month:{' '}
                <select value={month} onChange={(e) => setMonth(Number(e.target.value))} style={{ marginLeft: 'var(--spacing-xs)' }}>
                  {MONTH_LABELS.map((label, idx) => (
                    <option key={label} value={idx + 1}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                Year: <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} min="1970" max="2100" step="1" style={{ width: '6rem', marginLeft: 'var(--spacing-xs)' }} />
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: All-time summary, then Savings, then grid */}
      <div className="content-container">
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          <h2>All-Time Summary</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Income</span>
              <span>{allTotals.income.toFixed(2)} €</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Expense</span>
              <span>{allTotals.expense.toFixed(2)} €</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Net</span>
              <span style={{ color: allTotals.net >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>{allTotals.net.toFixed(2)} €</span>
            </div>
          </div>
        </div>

        <SavingsList />

        <div className="dashboard-grid">
          <div>
            <div className="calendar-card">
              <h2>Calendar</h2>
              <SingleMonthCalendar
                year={year}
                month={month}
                monthLabel={MONTH_LABELS[month - 1]}
                txByDay={transactions.reduce((acc, tx) => {
                  const d = new Date(tx.date);
                  const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).toString().padStart(2, '0')}`;
                  acc[iso] = (acc[iso] || 0) + 1;
                  return acc;
                }, {})}
                onDaySelect={(iso) => console.log('Day clicked:', iso)}
              />
            </div>

            <MonthlySummary transactions={transactions} />
          </div>

          <div>
            <TransactionForm onSuccess={handleAddSuccess} />
            <TransactionListSide transactions={transactions} loading={loadingTx} error={errorTx} onUpdate={handleUpdateTx} onDelete={handleDeleteTx} />
          </div>
        </div>
      </div>
    </div>
  );
}
