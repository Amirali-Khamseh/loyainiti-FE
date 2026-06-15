import React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './Select';
import { COUNTRIES } from '../lib/countries';

type Props = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
};

const labelStyle: React.CSSProperties = {
  font: 'var(--t-label)',
  color: 'var(--fg-2)',
  textTransform: 'uppercase',
  letterSpacing: '0.10em',
};

/** Labeled country dropdown matching the Input field's look, backed by COUNTRIES. */
export function CountrySelect({ label = 'Country', value, onChange, error, placeholder = 'Select country' }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <span style={labelStyle}>{label}</span>}
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger
          style={{
            width: '100%',
            padding: '10px 14px',
            borderColor: error ? 'var(--danger)' : 'var(--border-default)',
            font: 'var(--t-body)',
          }}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {COUNTRIES.map((c) => (
            <SelectItem key={c.code} value={c.name}>
              {c.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p style={{ font: 'var(--t-caption)', color: 'var(--danger)', margin: 0 }}>{error}</p>}
    </div>
  );
}
