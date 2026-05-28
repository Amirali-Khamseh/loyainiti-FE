import React from 'react';
import { Input } from './Input';

type DateRangePickerProps = {
  from: string;
  to: string;
  onChange: (range: { from: string; to: string }) => void;
};

/** Two date inputs side-by-side. Values are YYYY-MM-DD strings. */
export function DateRangePicker({ from, to, onChange }: DateRangePickerProps) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
      <div style={{ flex: 1 }}>
        <Input
          label="From"
          type="date"
          value={from}
          onChange={(e) => onChange({ from: e.target.value, to })}
        />
      </div>
      <div style={{ flex: 1 }}>
        <Input
          label="To"
          type="date"
          value={to}
          onChange={(e) => onChange({ from, to: e.target.value })}
        />
      </div>
    </div>
  );
}

/** Default range: today minus 30 days → today. ISO YYYY-MM-DD. */
export function defaultDateRange(): { from: string; to: string } {
  const now = new Date();
  const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return { from: past.toISOString().slice(0, 10), to: now.toISOString().slice(0, 10) };
}
