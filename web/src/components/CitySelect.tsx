import React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './Select';
import { CITIES_BY_COUNTRY } from '../lib/cities';

type Props = {
  label?: string;
  country: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
};

const labelStyle: React.CSSProperties = {
  font: 'var(--t-label)',
  color: 'var(--fg-2)',
  textTransform: 'uppercase',
  letterSpacing: '0.10em',
};

/** City dropdown that filters by the selected country. Disabled until a country is chosen. */
export function CitySelect({ label = 'City', country, value, onChange, error }: Props) {
  const cities = country ? (CITIES_BY_COUNTRY[country] ?? []) : [];
  const disabled = cities.length === 0;
  const placeholder = !country ? 'Select a country first' : 'Select city';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && <span style={labelStyle}>{label}</span>}
      <Select value={value || undefined} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          style={{
            width: '100%',
            padding: '10px 14px',
            borderColor: error ? 'var(--danger)' : 'var(--border-default)',
            font: 'var(--t-body)',
            opacity: disabled ? 0.5 : 1,
          }}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {cities.map((c) => (
            <SelectItem key={c} value={c}>{c}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <p style={{ font: 'var(--t-caption)', color: 'var(--danger)', margin: 0 }}>{error}</p>
      )}
    </div>
  );
}
