import { useAuth } from '../context/AuthContext';
import { useEffect, useState, useMemo } from 'react';
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
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    date: '',
    amount: '',
    type: 'expense',
    comment: ''
  });
  // Filter controls: selected month/year
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1); // 1..12
  const [year, setYear] = useState(now.getFullYear());

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle logout - clear user and redirect to login
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Handle form submission to add new transaction
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

  // Handle delete transaction
  const handleDelete = async (id) => {
    try {
      await transactionService.remove(id);
      // Remove from local state
      setTransactions((prev) => prev.filter((tx) => tx._id !== id));
    } catch (err) {
      setErrorTx(err?.response?.data?.message || 'Failed to delete transaction');
    }
  };

  // Start editing a transaction
  const startEdit = (tx) => {
    setEditingId(tx._id);
    setEditForm({
      date: tx.date ? tx.date.slice(0, 10) : '',
      amount: tx.amount,
      type: tx.type,
      comment: tx.comment || ''
    });
  };

  // Handle edit form input changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const { date, amount, type, comment } = editForm;
      const { data } = await transactionService.update(editingId, {
        date,
        amount: Number(amount),
        type,
        comment
      });
      // Update local list
      setTransactions((prev) => prev.map((tx) => (tx._id === editingId ? data.transaction : tx)));
      setEditingId(null);
      setEditForm({ date: '', amount: '', type: 'expense', comment: '' });
    } catch (err) {
      setErrorTx(err?.response?.data?.message || 'Failed to update transaction');
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ date: '', amount: '', type: 'expense', comment: '' });
  };

  // Fetch transactions for selected month/year
  const fetchTx = async (m, y) => {
    setLoadingTx(true);
    setErrorTx(null);
    try {
      const { data } = await transactionService.getByMonth(m, y);
      setTransactions(data.transactions || []);
    } catch (err) {
      setErrorTx(err?.response?.data?.message || 'Failed to load transactions');
    } finally {
      setLoadingTx(false);
    }
  };

  // Compute monthly totals from transactions
  const getTotals = (items) => {
    return items.reduce(
      (acc, tx) => {
        if (tx.type === 'income') acc.income += tx.amount;
        if (tx.type === 'expense') acc.expense += tx.amount;
        acc.net = acc.income - acc.expense;
        return acc;
      },
      { income: 0, expense: 0, net: 0 }
    );
  };

  // Compute monthly totals from the current transactions list
  const totals = useMemo(() => {
    return transactions.reduce(
      (acc, tx) => {
        if (tx.type === 'income') acc.income += tx.amount;
        else if (tx.type === 'expense') acc.expense += tx.amount;
        acc.net = acc.income - acc.expense;
        return acc;
      },
      { income: 0, expense: 0, net: 0 }
    );
  }, [transactions]);

  const formatCurrency = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(n);

  // Refetch when month/year changes
  useEffect(() => {
    fetchTx(month, year);
  }, [month, year]);

  // Fetch transactions on component mount
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
      {/* Month/Year Filters */}
      <h2>Filters</h2>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Month:{' '}
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1}
              </option>
            ))}
          </select>
        </label>
        <label style={{ marginLeft: '1rem' }}>
          Year: <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} min="1970" max="2100" step="1" style={{ width: '6rem' }} />
        </label>
      </div>
      {/* Monthly Totals */}
      <h2>Summary</h2>
      <div style={{ marginBottom: '1rem' }}>
        <span>Income: {formatCurrency(totals.income)}</span>
        <span>Expense: {formatCurrency(totals.expense)}</span>
        <span style={{ color: totals.net >= 0 ? 'green' : 'red' }}>Net: {formatCurrency(totals.net)}</span>
      </div>
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
        {transactions.map((tx) => {
          const isEditing = editingId === tx._id;
          return (
            <li key={tx._id}>
              {isEditing ? (
                <form onSubmit={handleEditSubmit} style={{ display: 'inline' }}>
                  <input type="date" name="date" value={editForm.date} onChange={handleEditChange} required />
                  <input type="number" name="amount" value={editForm.amount} onChange={handleEditChange} min="0" step="0.01" required />
                  <select name="type" value={editForm.type} onChange={handleEditChange}>
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                  <input type="text" name="comment" value={editForm.comment} onChange={handleEditChange} placeholder="Comment" />
                  <button type="submit">Save</button>
                  <button type="button" onClick={cancelEdit}>
                    Cancel
                  </button>
                </form>
              ) : (
                <>
                  <strong>{tx.type}</strong> — {tx.amount} on {new Date(tx.date).toLocaleDateString()}
                  {tx.comment ? ` — ${tx.comment}` : ''}{' '}
                  <button onClick={() => startEdit(tx)} style={{ marginLeft: '0.5rem' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDelete(tx._id)} style={{ marginLeft: '0.5rem' }}>
                    Delete
                  </button>
                </>
              )}
            </li>
          );
        })}
      </ul>
      {/* TODO: Add calendar here */}
      {/* TODO: Add monthly analytics here */}
    </div>
  );
}
