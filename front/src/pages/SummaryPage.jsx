import { useEffect, useState } from 'react';
import transactionService from '../services/transactionService';

export default function SummaryPage() {
  const [allTotals, setAllTotals] = useState({ income: 0, expense: 0, net: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllTotals = async () => {
      try {
        setLoading(true);
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
        console.error('Failed to load totals', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllTotals();
  }, []);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="content-container">
      <h1>Financial Summary</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 'var(--spacing-lg)', marginTop: 'var(--spacing-xl)' }}>
        {/* Total Income Card */}
        <div className="card" style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: 'var(--spacing-sm)' }}>Total Income</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-success)' }}>{allTotals.income.toFixed(2)} €</div>
        </div>

        {/* Total Expense Card */}
        <div className="card" style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: 'var(--spacing-sm)' }}>Total Expense</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-danger)' }}>{allTotals.expense.toFixed(2)} €</div>
        </div>

        {/* Net Balance Card */}
        <div className="card" style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
          <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: 'var(--spacing-sm)' }}>Net Balance</div>
          <div
            style={{
              fontSize: '2.5rem',
              fontWeight: 'bold',
              color: allTotals.net >= 0 ? 'var(--color-success)' : 'var(--color-danger)'
            }}
          >
            {allTotals.net.toFixed(2)} €
          </div>
        </div>
      </div>
    </div>
  );
}
