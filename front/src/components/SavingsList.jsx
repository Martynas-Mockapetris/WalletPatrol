import { useEffect, useState, useMemo } from 'react';
import savingsService from '../services/savingsService';

const getProgressColor = (p) => {
  if (p >= 100) return '#15803d'; // dark green
  if (p >= 80) return '#22c55e'; // green
  if (p >= 60) return '#84cc16'; // yellow-green
  if (p >= 40) return '#eab308'; // yellow
  if (p >= 20) return '#f97316'; // orange
  return '#ef4444'; // red
};

export default function SavingsList() {
  const [savings, setSavings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [newSaving, setNewSaving] = useState({ name: '', goalAmount: '' });
  const [adjust, setAdjust] = useState({}); // { [id]: amount }

  // Totals for balance check (income - expense - saved)
  const totals = useMemo(() => {
    const totalGoal = savings.reduce((s, g) => s + g.goalAmount, 0);
    const totalSaved = savings.reduce((s, g) => s + g.currentAmount, 0);
    return { totalGoal, totalSaved };
  }, [savings]);

  const fetchSavings = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await savingsService.getAll();
      setSavings(data.savings || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load savings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavings();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newSaving.name || !newSaving.goalAmount) return;
    try {
      const { data } = await savingsService.create({
        name: newSaving.name,
        goalAmount: Number(newSaving.goalAmount)
      });
      setSavings((prev) => [data.savings, ...prev]);
      setNewSaving({ name: '', goalAmount: '' });
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create savings goal');
    }
  };

  const handleAdjust = async (id, action) => {
    const amount = Number(adjust[id] || 0);
    if (!amount || amount <= 0) return;
    try {
      const { data } = action === 'add' ? await savingsService.addAmount(id, amount) : await savingsService.removeAmount(id, amount);
      setSavings((prev) => prev.map((s) => (s._id === id ? data.savings : s)));
      setAdjust((prev) => ({ ...prev, [id]: '' }));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update savings');
    }
  };

  const handleDelete = async (id) => {
    try {
      await savingsService.delete(id);
      setSavings((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete savings');
    }
  };

  return (
    <div style={{ marginTop: 'var(--spacing-lg)' }}>
      <h2>Savings</h2>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'var(--color-danger)' }}>{error}</p>}

      {/* Create new savings goal */}
      <form onSubmit={handleCreate} className="form-row" style={{ alignItems: 'flex-end' }}>
        <div className="form-row-flex-1 form-group">
          <label>Name</label>
          <input type="text" value={newSaving.name} onChange={(e) => setNewSaving((p) => ({ ...p, name: e.target.value }))} placeholder="Money saved for car" required />
        </div>
        <div className="form-row-flex-1 form-group">
          <label>Goal (€)</label>
          <input type="number" value={newSaving.goalAmount} onChange={(e) => setNewSaving((p) => ({ ...p, goalAmount: e.target.value }))} min="0" step="0.01" required />
        </div>
        <button type="submit" className="btn btn-primary">
          Create
        </button>
      </form>

      {/* List of savings */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        {savings.length === 0 && <p style={{ color: 'var(--color-text-muted)' }}>No savings goals yet</p>}
        {savings.map((s) => {
          const progress = s.goalAmount ? Math.min(100, (s.currentAmount / s.goalAmount) * 100) : 0;
          return (
            <div key={s._id} className="card" style={{ padding: 'var(--spacing-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{s.name}</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                    {s.currentAmount.toFixed(2)} € / {s.goalAmount.toFixed(2)} €
                  </div>
                </div>
                <button className="btn btn-danger" onClick={() => handleDelete(s._id)}>
                  Delete
                </button>
              </div>

              <div style={{ background: '#f3f4f6', borderRadius: 'var(--radius-sm)', height: '10px', overflow: 'hidden', marginBottom: 'var(--spacing-sm)' }}>
                <div
                  style={{
                    width: `${progress}%`,
                    height: '100%',
                    background: getProgressColor(progress),
                    transition: 'width 0.2s'
                  }}
                />
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: 'var(--spacing-sm)' }}>{progress.toFixed(0)}% of goal</div>

              <div className="form-row" style={{ alignItems: 'flex-end' }}>
                <div className="form-row-flex-1 form-group">
                  <label>Amount (€)</label>
                  <input type="number" min="0" step="0.01" value={adjust[s._id] ?? ''} onChange={(e) => setAdjust((p) => ({ ...p, [s._id]: e.target.value }))} />
                </div>
                <button type="button" className="btn btn-primary" onClick={() => handleAdjust(s._id, 'add')}>
                  Add
                </button>
                <button type="button" className="btn" onClick={() => handleAdjust(s._id, 'remove')}>
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Totals display (optional) */}
      <div style={{ marginTop: 'var(--spacing-md)', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
        Total Saved: {totals.totalSaved.toFixed(2)} € | Total Goals: {totals.totalGoal.toFixed(2)} €
      </div>
    </div>
  );
}
