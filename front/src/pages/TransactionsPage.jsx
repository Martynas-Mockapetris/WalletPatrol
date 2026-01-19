import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import transactionService from '../services/transactionService';
import TransactionForm from '../components/TransactionForm';
import TransactionListSide from '../components/TransactionListSide';
import MonthlySummary from '../components/MonthlySummary';
import SingleMonthCalendar from '../components/SingleMonthCalendar';

const MONTH_LABELS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [errorTx, setErrorTx] = useState(null);

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

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
    <div className="content-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-lg)' }}>
        <h1 style={{ margin: 0 }}>Transactions</h1>
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
                const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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
  );
}
