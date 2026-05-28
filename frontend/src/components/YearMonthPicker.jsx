import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

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

const POPOVER_WIDTH = 210;

const YearMonthPicker = ({ value, onChange, icon = true, placeholder = '', className = '' }) => {
  const [open, setOpen] = useState(false);
  const initialDate = value ? new Date(value + '-01') : new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const [popoverAlign, setPopoverAlign] = useState('left'); // 'left' | 'right'
  const ref = useRef(null);

  useOutsideClose(open, ref, () => setOpen(false));

  useEffect(() => {
    if (!value) return;
    const [year, month] = value.split('-');
    setViewYear(Number(year));
    setViewMonth(Number(month) - 1);
  }, [value]);

  /* 팝오버 열릴 때 뷰포트 기준으로 좌/우 정렬 자동 결정 */
  const handleOpen = useCallback(() => {
    setOpen((prev) => {
      const next = !prev;
      if (next && ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const spaceRight = window.innerWidth - rect.left;
        // 오른쪽 여백이 팝오버 너비보다 작으면 오른쪽 기준 정렬
        setPopoverAlign(spaceRight < POPOVER_WIDTH + 8 ? 'right' : 'left');
      }
      return next;
    });
  }, []);

  const handlePrevYear = () => setViewYear((y) => y - 1);
  const handleNextYear = () => setViewYear((y) => y + 1);
  const handleSelect = (month) => {
    const nextValue = `${viewYear}-${String(month + 1).padStart(2, '0')}`;
    onChange(nextValue);
    setOpen(false);
  };

  const popoverStyle = {
    minWidth: `${POPOVER_WIDTH}px`,
    position: 'absolute',
    top: 'calc(100% + 4px)',
    zIndex: 999,
    ...(popoverAlign === 'right'
      ? { right: 0, left: 'auto' }
      : { left: 0, right: 'auto' }),
  };

  return (
    <div
      className={`cmp-monthpicker-wrap ${className}`.trim()}
      ref={ref}
      style={{ position: 'relative' }}
    >
      <button
        type="button"
        className={`cmp-monthpicker-input${value ? ' filled' : ''}`}
        onClick={handleOpen}
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
        <div
          className="cmp-picker-popover cmp-datepicker-modal"
          style={popoverStyle}
        >
          {/* 헤더: 연도 + 이전/다음 화살표 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem 0.5rem',
            boxSizing: 'border-box',
            width: '100%',
          }}>
            <div>
              <div style={{
                fontSize: '0.625rem',
                fontWeight: 700,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '0.125rem',
              }}>
                YEAR/MONTH
              </div>
              <div style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: '#8ba888',
              }}>
                {viewYear}년
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              flexShrink: 0,
              marginLeft: '1rem',
            }}>
              <button
                type="button"
                onClick={handlePrevYear}
                style={{
                  width: '1.75rem',
                  height: '1.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  background: '#fff',
                  color: '#64748b',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                onClick={handleNextYear}
                style={{
                  width: '1.75rem',
                  height: '1.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  background: '#fff',
                  color: '#64748b',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* 월 그리드 */}
          <div className="cmp-datepicker-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {Array.from({ length: 12 }, (_, i) => (
              <button
                key={i}
                type="button"
                className={`cmp-datepicker-day${
                  viewMonth === i && viewYear === Number(value?.split('-')[0])
                    ? ' selected'
                    : ''
                }`}
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