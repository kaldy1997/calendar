import { useMemo } from 'react';
import { 
  getDaysInMonth, 
  getFirstDayOfMonth, 
  isWeekend 
} from '../../utils/dateUtils';
import './YearView.scss';

interface YearViewProps {
  currentDate: Date;
  onMonthSelect: (month: number) => void;
  direction?: 'left' | 'right' | null;
}

const WEEKDAYS_INITIALS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

export default function YearView({ currentDate, onMonthSelect, direction }: YearViewProps) {
  const year = currentDate.getFullYear();
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i), []);

  return (
    <div 
      className={`year-view ${direction ? `year-view--animate-${direction}` : ''}`} 
      data-testid="year-view"
    >
      <div className="year-view__grid">
        {months.map((monthIndex) => (
          <MiniMonth 
            key={monthIndex}
            year={year}
            month={monthIndex}
            onClick={() => onMonthSelect(monthIndex)}
          />
        ))}
      </div>
    </div>
  );
}

interface MiniMonthProps {
  year: number;
  month: number;
  onClick: () => void;
}

function MiniMonth({ year, month, onClick }: MiniMonthProps) {
  const monthName = useMemo(() => {
    const date = new Date(year, month, 1);
    return date.toLocaleDateString('es-ES', { month: 'long' });
  }, [year, month]);

  const days = useMemo(() => {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const totalDays: (number | null)[] = [];

    // Fill leading empty days
    for (let i = 0; i < firstDay; i++) {
      totalDays.push(null);
    }

    // Fill actual days
    for (let i = 1; i <= daysInMonth; i++) {
      totalDays.push(i);
    }

    return totalDays;
  }, [year, month]);

  return (
    <div className="mini-month" onClick={onClick}>
      <h3 className="mini-month__title">{monthName}</h3>
      <div className="mini-month__weekdays">
        {WEEKDAYS_INITIALS.map((initial, i) => (
          <div key={i} className="mini-month__weekday">{initial}</div>
        ))}
      </div>
      <div className="mini-month__days">
        {days.map((day, i) => {
          const isDayWeekend = day ? isWeekend(new Date(year, month, day)) : false;
          return (
            <div 
              key={i} 
              className={`mini-month__day ${isDayWeekend ? 'mini-month__day--weekend' : ''}`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}
