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

  const formatCurrency = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(n);

  return (
    <div>
      <h2>Summary</h2>
      <div style={{ marginBottom: '1rem' }}>
        <span>Income: {formatCurrency(totals.income)}</span>
        <span style={{ marginLeft: '1rem' }}>Expense: {formatCurrency(totals.expense)}</span>
        <span
          style={{
            marginLeft: '1rem',
            color: totals.net >= 0 ? 'green' : 'red'
          }}
        >
          Net: {formatCurrency(totals.net)}
        </span>
      </div>
    </div>
  );
}
