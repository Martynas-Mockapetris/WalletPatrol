import { useMemo } from 'react';

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const daysInMonth = (year, month) => new Date(year, month, 0).getDate(); // month: 1..12
const toISO = (y, m, d) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

// txByDay: map of YYYY-MM-DD -> count
export default function SingleMonthCalendar({ year, month, monthLabel, txByDay = {}, onDaySelect }) {
  const cells = useMemo(() => {
    const totalDays = daysInMonth(year, month);
    // Shift so Monday=0; JS getDay(): 0=Sun -> convert to 6, else d-1
    const firstDow = (new Date(year, month - 1, 1).getDay() + 6) % 7;
    const result = [];
    for (let b = 0; b < firstDow; b++) result.push(null);
    for (let d = 1; d <= totalDays; d++) {
      const iso = toISO(year, month, d);
      result.push({ day: d, iso, count: txByDay[iso] || 0 });
    }
    return result;
  }, [year, month, txByDay]);

  return (
    <div>
      {monthLabel && (
        <div style={{ fontWeight: 'bold', marginBottom: 'var(--spacing-sm)' }}>
          {year} {monthLabel}
        </div>
      )}
      <div className="calendar-container" style={{ marginBottom: '4px' }}>
        {WEEKDAYS.map((w) => (
          <div key={w} className="calendar-weekday">
            {w}
          </div>
        ))}
      </div>
      <div className="calendar-container">
        {cells.map((cell, idx) => {
          if (cell === null) return <div key={`blank-${idx}`} />;
          const { day, iso, count } = cell;
          const hasTx = count > 0;
          return (
            <div
              key={iso}
              onClick={() => onDaySelect?.(iso)}
              title={hasTx ? `${count} transaction(s)` : ''}
              className={`calendar-day ${hasTx ? 'calendar-day-with-tx' : ''}`}
              style={{
                cursor: onDaySelect ? 'pointer' : 'default'
              }}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
