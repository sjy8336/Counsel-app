import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const dayLabels = ['일', '월', '화', '수', '목', '금', '토'];

const formatDateValue = (value) => {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return `${year}년 ${Number(month)}월 ${Number(day)}일`;
};

const isTodayDate = (year, month, day) => {
  const today = new Date();
  return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
};

const useOutsideClose = (open, ref, onClose) => {
  useEffect(() => {
    if (!open) return undefined;
    const handleMouseDown = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [open, onClose, ref]);
};

const DatePicker = ({ value, onChange, icon = true, placeholder = '', className = '' }) => {
  const [open, setOpen] = useState(false);
  const initialDate = value ? new Date(value) : new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const ref = useRef(null);

  useOutsideClose(open, ref, () => setOpen(false));

  useEffect(() => {
    if (!value) return;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return;
    setViewYear(parsed.getFullYear());
    setViewMonth(parsed.getMonth());
  }, [value]);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const blanks = Array.from({ length: firstDay }, (_, index) => index);
  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);

  const handlePrevMonth = () => {
    const next = new Date(viewYear, viewMonth - 1, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const handleNextMonth = () => {
    const next = new Date(viewYear, viewMonth + 1, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const handleSelect = (day) => {
    const nextValue = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(nextValue);
    setOpen(false);
  };

  return (
    <div className={`cmp-monthpicker-wrap ${className}`.trim()} ref={ref}>
      <button
        type="button"
        className={`cmp-monthpicker-input${value ? ' filled' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
      >
        {icon && (
          <span className="cmp-picker-input-icon">
            <Calendar size={15} />
          </span>
        )}
        <span>{value ? formatDateValue(value) : placeholder || '날짜 선택'}</span>
        <ChevronDown size={14} className={`cmp-picker-input-chevron${open ? ' open' : ''}`} />
      </button>

      {open && (
        <div className="cmp-picker-popover cmp-datepicker-modal">
          <div className="cmp-picker-popover-head">
            <div>
              <div className="cmp-picker-popover-eyebrow">Date</div>
              <div className="cmp-picker-popover-title">
                {viewYear}년 {viewMonth + 1}월
              </div>
            </div>
            <div className="cmp-picker-nav">
              <button type="button" className="cmp-picker-nav-btn" onClick={handlePrevMonth}>
                <ChevronLeft size={14} />
              </button>
              <button type="button" className="cmp-picker-nav-btn" onClick={handleNextMonth}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          <div className="cmp-datepicker-weekdays">
            {dayLabels.map((dayLabel) => (
              <span key={dayLabel}>{dayLabel}</span>
            ))}
          </div>

          <div className="cmp-datepicker-grid">
            {blanks.map((blank) => (
              <div key={`blank-${blank}`} className="cmp-datepicker-blank" />
            ))}
            {days.map((day) => {
              const selected =
                value ===
                `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isToday = isTodayDate(viewYear, viewMonth, day);

              return (
                <button
                  key={day}
                  type="button"
                  className={`cmp-datepicker-day${selected ? ' selected' : ''}${isToday ? ' today' : ''}`}
                  onClick={() => handleSelect(day)}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
