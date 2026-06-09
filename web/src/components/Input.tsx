import React, { forwardRef, useId } from 'react';

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  leftSlot?: React.ReactNode;
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
  borderRadius: 4,
  padding: '10px 14px',
  font: 'var(--t-body)',
  color: 'var(--fg-1)',
  transition: 'border-color var(--dur-1) var(--ease-out), box-shadow var(--dur-1) var(--ease-out)',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, leftSlot, style, ...rest },
  ref,
) {
  const id = useId();
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
          style={{
            border: 'none',
            outline: 'none',
            background: 'transparent',
            flex: 1,
            color: 'inherit',
            ...style,
          }}
        />
      </div>
      {(hint || error) && (
        <p style={{ font: 'var(--t-caption)', color: error ? 'var(--danger)' : 'var(--fg-3)', margin: 0 }}>
          {error ?? hint}
        </p>
      )}
    </div>
  );
});
