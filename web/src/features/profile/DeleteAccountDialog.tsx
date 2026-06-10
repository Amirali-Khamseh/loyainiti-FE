import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { auth } from '../../lib/auth';
import { api, ApiError } from '../../lib/api';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { useToast } from '../../components/Toast';

type Props = {
  open: boolean;
  onClose: () => void;
};

// Light-theme overrides so that Button and Input CSS-var consumers
// render correctly against the white dialog background.
const lightVars: React.CSSProperties = {
  '--fg-1': '#052698',
  '--fg-2': '#1E3880',
  '--fg-3': '#878EA0',
  '--bg-card': '#F0F4FA',
  '--bg-muted': '#E8EEF8',
  '--border-default': 'rgba(5,38,152,0.15)',
  '--border-subtle': 'rgba(5,38,152,0.08)',
} as React.CSSProperties;

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
  padding: 24,
};

export function DeleteAccountDialog({ open, onClose }: Props) {
  const toast = useToast();
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setPassword('');
      setError('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const deleteMut = useMutation({
    mutationFn: () => api('/api/me', { method: 'DELETE', body: { password } }),
    onSuccess: async () => {
      qc.clear();
      await auth.signOut();
      window.location.href = '/sign-in';
    },
    onError: (e) => {
      const msg = e instanceof ApiError ? e.message : 'Could not delete account';
      setError(msg);
    },
  });

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) { setError('Please enter your password'); return; }
    setError('');
    deleteMut.mutate();
  };

  return (
    <div style={overlayStyle} onClick={(e) => { if (e.target === e.currentTarget && !deleteMut.isPending) onClose(); }}>
      <div
        style={{ ...lightVars, background: '#fff', borderRadius: 8, padding: 28, width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-title"
      >
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: 1.1, textTransform: 'uppercase', color: 'var(--danger)', marginBottom: 6 }}>
            Danger zone
          </p>
          <h2 id="delete-title" style={{ font: 'var(--t-h3)', color: '#052698', margin: 0 }}>
            Delete account?
          </h2>
        </div>
        <p style={{ font: 'var(--t-body)', color: '#1E3880', margin: 0 }}>
          This permanently deletes your account, loyalty history, and all associated data.
          This action <strong>cannot be undone</strong>.
        </p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            ref={inputRef}
            label="Confirm your password"
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(''); }}
            autoComplete="current-password"
            error={error}
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={deleteMut.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="danger"
              loading={deleteMut.isPending}
              disabled={!password}
            >
              Delete my account
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
