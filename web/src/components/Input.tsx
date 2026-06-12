import React, { forwardRef, useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  leftSlot?: React.ReactNode;
  showPasswordToggle?: boolean;
};

const wrapperStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
};

const labelStyle: React.CSSProperties = {
  font: 'var(--t-label)',
  color: 'var(--fg-2)',
  textTransform: 'uppercase',
  letterSpacing: '0.10em',
};

const fieldStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  background: 'var(--bg-card)',
  border: '1px solid var(--border-default)',
  borderRadius: 10,
  padding: '10px 14px',
  font: 'var(--t-body)',
  color: 'var(--fg-1)',
  transition: 'border-color var(--dur-1) var(--ease-out), box-shadow var(--dur-1) var(--ease-out)',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, leftSlot, style, showPasswordToggle, type, ...rest },
  ref,
) {
  const id = useId();
  const [shown, setShown] = useState(false);
  const isPassword = type === 'password' && showPasswordToggle;

  return (
    <div style={wrapperStyle}>
      {label && (
        <label htmlFor={id} style={labelStyle}>
          {label}
        </label>
      )}
      <div
        style={{
          ...fieldStyle,
          borderColor: error ? 'var(--danger)' : (fieldStyle.border as string).split(' ')[2],
        }}
      >
        {leftSlot}
        <input
          {...rest}
          ref={ref}
          id={id}
          type={isPassword && shown ? 'text' : type}
          style={{
            border: 'none',
            outline: 'none',
            background: 'transparent',
            flex: 1,
            color: 'inherit',
            font: 'inherit',
            ...style,
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShown((s) => !s)}
            aria-label={shown ? 'Hide password' : 'Show password'}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              color: 'var(--fg-3)',
              flexShrink: 0,
            }}
          >
            {shown ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
      {(hint || error) && (
        <p style={{ font: 'var(--t-caption)', color: error ? 'var(--danger)' : 'var(--fg-3)', margin: 0 }}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
});
