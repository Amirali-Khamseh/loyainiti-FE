import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, ApiError } from '../../lib/api';
import { Card } from '../../components/Card';
import { useToast } from '../../components/Toast';

type Role = 'customer' | 'business_owner' | 'staff' | 'admin';
type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
  banned: boolean;
  createdAt: string;
};

const ROLE_LABELS: Record<Role, string> = {
  customer: 'Customer',
  business_owner: 'Business owner',
  staff: 'Staff',
  admin: 'Admin',
};

const selectStyle: React.CSSProperties = {
  height: 36, borderRadius: 8, border: '1px solid var(--border-default)',
  padding: '0 10px', font: 'var(--t-body-sm)', background: 'var(--bg-card)', color: 'var(--fg-1)',
};

export function ConsoleUsersPage() {
  const toast = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');

  const users = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api<AdminUser[]>('/api/admin/users'),
  });

  const roleMut = useMutation({
    mutationFn: (v: { id: string; role: Role }) =>
      api(`/api/admin/users/${v.id}/role`, { method: 'PATCH', body: { role: v.role } }),
    onSuccess: () => { toast.success('Role updated'); qc.invalidateQueries({ queryKey: ['admin-users'] }); },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Could not update role'),
  });

  const filtered = (users.data ?? []).filter(
    (u) => u.name.toLowerCase().includes(search.toLowerCase()) ||
           u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <header>
        <span className="label">Console</span>
        <h1 className="display-2" style={{ marginTop: 8 }}>Users</h1>
        <p className="body-lg" style={{ color: 'var(--fg-2)', marginTop: 8 }}>
          {users.data?.length ?? '…'} total. Change a user's platform role here; per-business
          staff roles are managed from the Businesses tab or the owner's Staff page.
        </p>
      </header>

      <input
        type="search"
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: '100%', maxWidth: 400, padding: '10px 14px',
          borderRadius: 12, border: '1px solid var(--border-default)',
          font: 'var(--t-body)', background: 'var(--bg-card)', color: 'var(--fg-1)',
        }}
      />

      <Card padding={0}>
        {users.isLoading ? (
          <p className="body" style={{ padding: 24 }}>Loading…</p>
        ) : (
          <div>
            {filtered.map((u, i) => (
              <div key={u.id} style={{
                display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px',
                borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)', flexWrap: 'wrap',
              }}>
                <div style={{ flex: 1, minWidth: 180 }}>
                  <p style={{ font: 'var(--t-body)', fontWeight: 600, margin: 0 }}>{u.name}</p>
                  <p className="caption" style={{ color: 'var(--fg-3)' }}>{u.email}</p>
                </div>
                <span className="caption" style={{ color: 'var(--fg-3)', minWidth: 100 }}>
                  {new Date(u.createdAt).toLocaleDateString()}
                </span>
                {u.banned && (
                  <span className="label" style={{ color: 'var(--danger)' }}>Banned</span>
                )}
                <select
                  value={u.role}
                  onChange={(e) => roleMut.mutate({ id: u.id, role: e.target.value as Role })}
                  disabled={roleMut.isPending}
                  style={selectStyle}
                >
                  {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="body" style={{ padding: 24, color: 'var(--fg-3)' }}>No users found.</p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
