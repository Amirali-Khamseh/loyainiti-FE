/**
 * Select - Radix UI primitive styled with our design tokens.
 * Same accessible, animated dropdown that Shadcn's <Select> is built on.
 *
 * Usage:
 *   <Select value={v} onValueChange={setV}>
 *     <SelectTrigger><SelectValue placeholder="Pick one" /></SelectTrigger>
 *     <SelectContent>
 *       <SelectItem value="a">Option A</SelectItem>
 *       <SelectItem value="b">Option B</SelectItem>
 *     </SelectContent>
 *   </Select>
 */
import React from 'react';
import * as RadixSelect from '@radix-ui/react-select';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';

type SelectProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
};

type SelectTriggerProps = {
  children: React.ReactNode;
  style?: React.CSSProperties;
};

type SelectContentProps = { children: React.ReactNode };
type SelectItemProps = { value: string; children: React.ReactNode; disabled?: boolean };

export function Select({ children, ...props }: SelectProps) {
  return <RadixSelect.Root {...props}>{children}</RadixSelect.Root>;
}

export function SelectTrigger({ children, style }: SelectTriggerProps) {
  return (
    <RadixSelect.Trigger
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        minWidth: 140,
        padding: '8px 12px',
        borderRadius: 4,
        border: '1px solid var(--border-default)',
        background: 'var(--bg-card)',
        color: 'var(--fg-1)',
        font: 'var(--t-body-sm)',
        cursor: 'pointer',
        outline: 'none',
        transition: 'border-color 120ms ease-out, box-shadow 120ms ease-out',
        ...style,
      }}
      onFocus={(e) => {
        e.currentTarget.style.borderColor = 'var(--action)';
        e.currentTarget.style.boxShadow = '0 0 0 3px var(--action-subtle-bg)';
      }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-default)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {children}
      <RadixSelect.Icon>
        <ChevronDown size={14} color="var(--fg-3)" />
      </RadixSelect.Icon>
    </RadixSelect.Trigger>
  );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  return <RadixSelect.Value placeholder={placeholder} />;
}

export function SelectContent({ children }: SelectContentProps) {
  return (
    <RadixSelect.Portal>
      <RadixSelect.Content
        position="popper"
        sideOffset={6}
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: 4,
          padding: 4,
          boxShadow: 'var(--shadow-3)',
          zIndex: 9999,
          minWidth: 'var(--radix-select-trigger-width)',
          maxHeight: 'var(--radix-select-content-available-height)',
          overflowY: 'auto',
        }}
      >
        <RadixSelect.ScrollUpButton style={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
          <ChevronUp size={14} color="var(--fg-3)" />
        </RadixSelect.ScrollUpButton>
        <RadixSelect.Viewport>{children}</RadixSelect.Viewport>
        <RadixSelect.ScrollDownButton style={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
          <ChevronDown size={14} color="var(--fg-3)" />
        </RadixSelect.ScrollDownButton>
      </RadixSelect.Content>
    </RadixSelect.Portal>
  );
}

export function SelectItem({ value, children, disabled }: SelectItemProps) {
  return (
    <RadixSelect.Item
      value={value}
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 32px 8px 10px',
        borderRadius: 4,
        font: 'var(--t-body-sm)',
        color: 'var(--fg-1)',
        cursor: 'pointer',
        position: 'relative',
        userSelect: 'none',
        outline: 'none',
        opacity: disabled ? 0.4 : 1,
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--action-subtle-bg)'; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
      onFocus={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--action-subtle-bg)'; }}
      onBlur={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
    >
      <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
      <RadixSelect.ItemIndicator style={{ position: 'absolute', right: 8 }}>
        <Check size={14} color="var(--action)" />
      </RadixSelect.ItemIndicator>
    </RadixSelect.Item>
  );
}
