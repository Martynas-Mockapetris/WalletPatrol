// CalendarYear: Displays all 12 months for a given year.
// Highlights days that have transactions by using a simple map of YYYY-MM-DD → count.
import { useEffect, useState, useMemo } from 'react';
import transactionService from '../services/transactionService';

// Helper: human-readable month names
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

// Helper: number of days in a given month/year
const daysInMonth = (year, month) => new Date(year, month, 0).getDate(); // month: 1..12

// Helper: ISO date string YYYY-MM-DD
const toISODate = (year, month, day) => `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

export default function CalendarYear({ year, onMonthSelect }) {
  // Map of date string → transaction count
  const [txByDay, setTxByDay] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all months for the selected year (12 requests).
  // Note: We can optimize later with a backend endpoint like /transactions/year.
  useEffect(() => {
    const fetchYear = async () => {
      setLoading(true);
      setError(null);
      try {
        const months = Array.from({ length: 12 }, (_, i) => i + 1); // 1..12
        const results = await Promise.all(months.map((m) => transactionService.getByMonth(m, year)));

        // Build date → count map
        const map = {};
        for (const res of results) {
          const items = res?.data?.transactions || [];
          for (const tx of items) {
            // Normalize to local date (or use UTC if you prefer)
            const d = new Date(tx.date);
            const iso = toISODate(d.getFullYear(), d.getMonth() + 1, d.getDate());
            map[iso] = (map[iso] || 0) + 1;
          }
        }
        setTxByDay(map);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load calendar data');
      } finally {
        setLoading(false);
      }
    };

    fetchYear();
  }, [year]);

  // Render helper: month grid with weekday alignment
  const monthsGrid = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => {
      const month = i + 1; // 1..12
      const totalDays = daysInMonth(year, month);

      // First day-of-week offset (0=Monday .. 6=Sunday)
      // getDay() returns 0=Sun, 1=Mon... so shift by (getDay() || 7) - 1 to get 0=Mon
      const firstDow = (new Date(year, month - 1, 1).getDay() || 7) - 1;

      // Create array with leading blanks + actual days
      const cells = [];
      for (let b = 0; b < firstDow; b++) cells.push(null); // leading blanks

      for (let day = 1; day <= totalDays; day++) {
        const iso = toISODate(year, month, day);
        const hasTx = !!txByDay[iso];
        cells.push({ day, iso, hasTx, count: txByDay[iso] || 0 });
      }

      return { monthIndex: i, monthName: MONTH_NAMES[i], cells };
    });
  }, [year, txByDay]);

  return (
    <div>
      <h2>Calendar ({year})</h2>
      {loading && <p>Loading calendar…</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* 3 columns x 4 rows layout for 12 months */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(1fr)',
          gap: '1rem'
        }}
      >
        {monthsGrid.map((m) => (
          <div
            key={m.monthIndex}
            onClick={() => onMonthSelect?.(m.monthIndex + 1, year)} // Notify parent when month clicked
            style={{
              border: '1px solid #ddd',
              padding: '0.5rem',
              cursor: 'pointer',
              background: '#f9f9f9'
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{m.monthName}</div>

            {/* Weekday headers (Mon..Sun) */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '4px',
                marginBottom: '4px',
                color: '#666',
                fontSize: '0.85rem'
              }}
            >
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((w) => (
                <div key={w} style={{ textAlign: 'center' }}>
                  {w}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: '4px'
              }}
            >
              {m.cells.map((cell, idx) => {
                if (cell === null) {
                  // Leading blank to align first day of month
                  return <div key={`blank-${idx}`} />;
                }
                const { day, hasTx, count } = cell;
                return (
                  <div
                    key={cell.iso}
                    title={hasTx ? `${count} transaction(s)` : ''}
                    style={{
                      textAlign: 'center',
                      padding: '6px 0',
                      borderRadius: '4px',
                      border: '1px solid #eee',
                      background: hasTx ? '#d6f5d6' : '#fff' // highlight days with transactions
                    }}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
