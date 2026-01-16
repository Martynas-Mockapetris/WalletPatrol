// MonthlySummary: Display income, expense, net totals
import { useMemo } from 'react';

export default function MonthlySummary({ transactions }) {
  // Compute totals
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

  const formatMoney = (n) => `${n.toFixed(2)} €`;

  return (
    <div className="summary-block">
      <h2>Summary</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Income</span>
          <span style={{ color: 'var(--color-success)' }}>{formatMoney(totals.income)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Expense</span>
          <span style={{ color: 'var(--color-danger)' }}>{formatMoney(totals.expense)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
          <span>Net</span>
          <span style={{ color: totals.net >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>{formatMoney(totals.net)}</span>
        </div>
      </div>
    </div>
  );
}
