// TransactionForm: Form to add new transactions
import { useState } from 'react';
import transactionService from '../services/transactionService';


export default function TransactionForm({ onSuccess }) {
  const [form, setForm] = useState({
    date: '',
    amount: '',
    type: 'expense',
    comment: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const { date, amount, type, comment } = form;
      const { data } = await transactionService.create(date, Number(amount), type, comment);
      onSuccess(data.transaction); // Notify parent
      setForm({ date: '', amount: '', type: 'expense', comment: '' });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save transaction');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2>Add Transaction</h2>
      <form onSubmit={handleSubmit} style={{ marginBottom: 'var(--spacing-lg)' }}>
        {/* Row 1: Date, Amount, Type */}
        <div className="form-row">
          <input type="date" name="date" value={form.date} onChange={handleChange} required className="form-row-flex-1" />
          <input type="number" name="amount" placeholder="Amount" value={form.amount} onChange={handleChange} min="0" step="0.01" required className="form-row-flex-1" />
          <select name="type" value={form.type} onChange={handleChange} className="form-row-flex-1">
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        {/* Row 2: Comment, Add button */}
        <div className="form-row">
          <input type="text" name="comment" placeholder="Comment (optional)" value={form.comment} onChange={handleChange} className="form-row-flex-1" />
          <button type="submit" disabled={saving} className="btn btn-primary" style={{ minWidth: '100px' }}>
            {saving ? 'Saving...' : 'Add'}
          </button>
        </div>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
