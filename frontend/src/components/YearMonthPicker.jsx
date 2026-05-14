import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const dayLabels = ['일', '월', '화', '수', '목', '금', '토'];

const formatDateValue = (value) => {
  if (!value) return '';
  const [year, month] = value.split('-');
  return `${year}년 ${Number(month)}월`;
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

const YearMonthPicker = ({ value, onChange, icon = true, placeholder = '', className = '' }) => {
  const [open, setOpen] = useState(false);
  const initialDate = value ? new Date(value + '-01') : new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const ref = useRef(null);

  useOutsideClose(open, ref, () => setOpen(false));

  useEffect(() => {
    if (!value) return;
    const [year, month] = value.split('-');
    setViewYear(Number(year));
    setViewMonth(Number(month) - 1);
  }, [value]);

  const handlePrevYear = () => setViewYear((y) => y - 1);
  const handleNextYear = () => setViewYear((y) => y + 1);
  const handleSelect = (month) => {
    const nextValue = `${viewYear}-${String(month + 1).padStart(2, '0')}`;
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
        <span>{value ? formatDateValue(value) : placeholder || '연/월 선택'}</span>
        <ChevronDown size={14} className={`cmp-picker-input-chevron${open ? ' open' : ''}`} />
      </button>

      {open && (
        <div className="cmp-picker-popover cmp-datepicker-modal">
          <div className="cmp-picker-popover-head">
            <div>
              <div className="cmp-picker-popover-eyebrow">Year/Month</div>
              <div className="cmp-picker-popover-title">
                {viewYear}년
              </div>
            </div>
            <div className="cmp-picker-nav">
              <button type="button" className="cmp-picker-nav-btn" onClick={handlePrevYear}>
                <ChevronLeft size={14} />
              </button>
              <button type="button" className="cmp-picker-nav-btn" onClick={handleNextYear}>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
          <div className="cmp-datepicker-grid" style={{gridTemplateColumns: 'repeat(3, 1fr)'}}>
            {Array.from({ length: 12 }, (_, i) => (
              <button
                key={i}
                type="button"
                className={`cmp-datepicker-day${viewMonth === i && viewYear === Number(value?.split('-')[0]) ? ' selected' : ''}`}
                onClick={() => handleSelect(i)}
              >
                {i + 1}월
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default YearMonthPicker;
