import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';
import transactionService from '../services/transactionService';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [errorTx, setErrorTx] = useState(null);
  const [form, setForm] = useState({
    date: '',
    amount: '',
    type: 'expense',
    comment: ''
  });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle logout - clear user and redirect to login
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const { date, amount, type, comment } = form;
      const { data } = await transactionService.create(date, Number(amount), type, comment);
      // Prepend new transaction to the list
      setTransactions((prev) => [data.transaction, ...prev]);
      // Reset form
      setForm({ date: '', amount: '', type: 'expense', comment: '' });
    } catch (err) {
      setSaveError(err?.response?.data?.message || 'Failed to save transaction');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const now = new Date();
    const month = now.getMonth() + 1; // JS months are 0-based
    const year = now.getFullYear();

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
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {user?.name}!</p>
      <p>Email: {user?.email}</p>
      <button onClick={handleLogout}>Logout</button>
      {/* Transaction Form */}
      <h2>Add Transaction</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
        <input type="date" name="date" value={form.date} onChange={handleChange} required />
        <input type="number" name="amount" placeholder="Amount" value={form.amount} onChange={handleChange} min="0" step="0.01" required />
        <select name="type" value={form.type} onChange={handleChange}>
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
        <input type="text" name="comment" placeholder="Comment (optional)" value={form.comment} onChange={handleChange} />
        <button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Add'}
        </button>
      </form>
      {saveError && <p style={{ color: 'red' }}>{saveError}</p>}
      {/* Transaction list */}
      <h2>Transactions</h2>
      {loadingTx && <p>Loading...</p>}
      {errorTx && <p style={{ color: 'red' }}>{errorTx}</p>}
      {!loadingTx && transactions.length === 0 && <p>No transactions for this month.</p>}
      <ul>
        {transactions.map((tx) => (
          <li key={tx._id}>
            <strong>{tx.type}</strong> — {tx.amount} on {new Date(tx.date).toLocaleDateString()}
            {tx.comment ? ` — ${tx.comment}` : ''}
          </li>
        ))}
      </ul>
      {/* TODO: Add calendar here */}
      {/* TODO: Add monthly analytics here */}
    </div>
  );
}
