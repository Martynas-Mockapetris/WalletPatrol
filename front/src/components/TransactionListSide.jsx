// TransactionListSideBySide: Display income and expense transactions in two columns
import { useState } from 'react';
import transactionService from '../services/transactionService';

export default function TransactionListSideBySide({ transactions, loading, error, onUpdate, onDelete }) {
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    date: '',
    amount: '',
    type: 'expense',
    comment: ''
  });

  // Separate transactions by type
  const incomes = transactions.filter((tx) => tx.type === 'income');
  const expenses = transactions.filter((tx) => tx.type === 'expense');

  const startEdit = (tx) => {
    setEditingId(tx._id);
    setEditForm({
      date: tx.date ? tx.date.slice(0, 10) : '',
      amount: tx.amount,
      type: tx.type,
      comment: tx.comment || ''
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

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
      onUpdate(data.transaction);
      setEditingId(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await transactionService.remove(id);
      onDelete(id);
    } catch (err) {
      console.error(err);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  // Render a single transaction (shared by both columns)
  const renderTx = (tx) => {
    const isEditing = editingId === tx._id;
    const formatMoney = (n) => `${n.toFixed(2)} €`;

    return (
      <li key={tx._id} className="transaction-item">
        {isEditing ? (
          <form onSubmit={handleEditSubmit} className="form-row" style={{ flexDirection: 'column', width: '100%' }}>
            <input type="date" name="date" value={editForm.date} onChange={handleEditChange} required />
            <input type="number" name="amount" value={editForm.amount} onChange={handleEditChange} min="0" step="0.01" required />
            <input type="text" name="comment" value={editForm.comment} onChange={handleEditChange} placeholder="Comment" />
            <div className="form-row">
              <button type="submit" className="btn btn-primary">
                Save
              </button>
              <button type="button" onClick={cancelEdit} className="btn">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 'var(--spacing-md)', flex: 1, alignItems: 'center' }}>
              <div className="transaction-amount">{formatMoney(tx.amount)}</div>
              <div className="transaction-date">{new Date(tx.date).toLocaleDateString()}</div>
              <div className="transaction-comment">{tx.comment || '—'}</div>
            </div>
            <div className="transaction-actions">
              <button onClick={() => startEdit(tx)} className="btn btn-primary">Edit</button>
              <button onClick={() => handleDelete(tx._id)} className="btn btn-danger">Delete</button>
            </div>
          </>
        )}
      </li>
    );
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2>Transactions</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-lg)' }}>
        <div className="income-section">
          <h3>Incomes ({incomes.length})</h3>
          {incomes.length === 0 ? <p style={{ color: 'var(--color-text-muted)' }}>No incomes</p> : <ul style={{ listStyle: 'none', padding: 0 }}>{incomes.map(renderTx)}</ul>}
        </div>

        <div className="expense-section">
          <h3>Expenses ({expenses.length})</h3>
          {expenses.length === 0 ? <p style={{ color: 'var(--color-text-muted)' }}>No expenses</p> : <ul style={{ listStyle: 'none', padding: 0 }}>{expenses.map(renderTx)}</ul>}
        </div>
      </div>
    </div>
  );
}
