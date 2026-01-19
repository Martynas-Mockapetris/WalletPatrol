import { useEffect, useState } from 'react';
import transactionService from '../services/transactionService';
import savingsService from '../services/savingsService';

export default function SummaryPage() {
  const [allTotals, setAllTotals] = useState({ income: 0, expense: 0, net: 0 });
  const [totalSaved, setTotalSaved] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch transactions
        const { data: txData } = await transactionService.getAll();
        const totals = txData.transactions.reduce(
          (acc, tx) => {
            if (tx.type === 'income') acc.income += tx.amount;
            else if (tx.type === 'expense') acc.expense += tx.amount;
            return acc;
          },
          { income: 0, expense: 0, net: 0 }
        );
        totals.net = totals.income - totals.expense;
        setAllTotals(totals);

        // Fetch savings
        const { data: savingsData } = await savingsService.getAll();
        const saved = savingsData.savings.reduce((sum, s) => sum + s.currentAmount, 0);
        setTotalSaved(saved);
      } catch (err) {
        console.error('Failed to load data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const netAfterSavings = allTotals.net - totalSaved;

  if (loading) return <p>Loading...</p>;

  return (
    <div className="content-container">
      <h1>Financial Summary</h1>

      <div style={{ marginTop: 'var(--spacing-xl)' }}>
        {/* Top Row: 3 Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
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

        {/* Bottom Row: 2 Cards (Centered) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-lg)', maxWidth: '66%', margin: '0 auto' }}>
          {/* Total Saved Card */}
          <div className="card" style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: 'var(--spacing-sm)' }}>Total Saved</div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#8b5cf6' }}>{totalSaved.toFixed(2)} €</div>
          </div>

          {/* Net After Savings Card */}
          <div className="card" style={{ padding: 'var(--spacing-lg)', textAlign: 'center' }}>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: 'var(--spacing-sm)' }}>Available Balance</div>
            <div
              style={{
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: netAfterSavings >= 0 ? 'var(--color-success)' : 'var(--color-danger)'
              }}
            >
              {netAfterSavings.toFixed(2)} €
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
