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
    return (
      <li key={tx._id} style={{ marginBottom: '0.5rem', padding: '0.5rem', border: '1px solid #f0f0f0' }}>
        {isEditing ? (
          <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <input type="date" name="date" value={editForm.date} onChange={handleEditChange} required />
            <input type="number" name="amount" value={editForm.amount} onChange={handleEditChange} min="0" step="0.01" required />
            <input type="text" name="comment" value={editForm.comment} onChange={handleEditChange} placeholder="Comment" />
            <div>
              <button type="submit" style={{ marginRight: '0.5rem' }}>
                Save
              </button>
              <button type="button" onClick={cancelEdit}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <>
            <div style={{ fontWeight: 'bold' }}>{tx.amount}</div>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>{new Date(tx.date).toLocaleDateString()}</div>
            {tx.comment && <div style={{ fontSize: '0.9rem' }}>{tx.comment}</div>}
            <div style={{ marginTop: '0.5rem' }}>
              <button onClick={() => startEdit(tx)} style={{ marginRight: '0.5rem', fontSize: '0.85rem' }}>
                Edit
              </button>
              <button onClick={() => handleDelete(tx._id)} style={{ fontSize: '0.85rem' }}>
                Delete
              </button>
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
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Incomes column */}
        <div style={{ border: '1px solid #e0f0e0', borderRadius: '4px', padding: '1rem', background: '#f5fff5' }}>
          <h3 style={{ color: 'green' }}>Incomes ({incomes.length})</h3>
          {incomes.length === 0 ? <p style={{ color: '#999' }}>No incomes</p> : <ul style={{ listStyle: 'none', padding: 0 }}>{incomes.map(renderTx)}</ul>}
        </div>

        {/* Expenses column */}
        <div style={{ border: '1px solid #ffe0e0', borderRadius: '4px', padding: '1rem', background: '#fff5f5' }}>
          <h3 style={{ color: 'red' }}>Expenses ({expenses.length})</h3>
          {expenses.length === 0 ? <p style={{ color: '#999' }}>No expenses</p> : <ul style={{ listStyle: 'none', padding: 0 }}>{expenses.map(renderTx)}</ul>}
        </div>
      </div>
    </div>
  );
}
