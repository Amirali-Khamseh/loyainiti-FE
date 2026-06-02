import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, UserPlus } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { useToast } from '../../components/Toast';

type AdminBusiness = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  isPublished: boolean;
  ownerEmail: string | null;
  createdAt: string;
};

const selectStyle: React.CSSProperties = {
  height: 36, borderRadius: 8, border: '1px solid var(--border-default)',
  padding: '0 10px', font: 'var(--t-body-sm)', background: 'var(--bg-card)', color: 'var(--fg-1)',
};

export function ConsoleBusinessesPage() {
  const toast = useToast();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const businesses = useQuery({
    queryKey: ['admin-businesses'],
    queryFn: () => api<AdminBusiness[]>('/api/admin/businesses'),
  });

  const filtered = (businesses.data ?? []).filter(
    (b) => b.name.toLowerCase().includes(search.toLowerCase()) ||
           (b.ownerEmail ?? '').toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <header>
        <span className="label">Console</span>
        <h1 className="display-2" style={{ marginTop: 8 }}>Businesses</h1>
        <p className="body-lg" style={{ color: 'var(--fg-2)', marginTop: 8 }}>
          All businesses including unpublished. Expand to assign staff.
        </p>
      </header>

      <input
        type="search"
        placeholder="Search by name or owner email…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          width: '100%', maxWidth: 400, padding: '10px 14px',
          borderRadius: 12, border: '1px solid var(--border-default)',
          font: 'var(--t-body)', background: 'var(--bg-card)', color: 'var(--fg-1)',
        }}
      />

      <Card padding={0}>
        {businesses.isLoading ? (
          <p className="body" style={{ padding: 24 }}>Loading…</p>
        ) : (
          <div>
            {filtered.map((b, i) => (
              <div key={b.id}>
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px',
                    borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
                    cursor: 'pointer',
                  }}
                  onClick={() => setExpanded(expanded === b.id ? null : b.id)}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <p style={{ font: 'var(--t-body)', fontWeight: 600, margin: 0 }}>{b.name}</p>
                      <span className="caption" style={{
                        padding: '2px 8px', borderRadius: 999,
                        background: b.isPublished ? 'var(--success-bg)' : 'var(--bg-muted)',
                        color: b.isPublished ? 'var(--success)' : 'var(--fg-3)',
                      }}>
                        {b.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <p className="caption" style={{ color: 'var(--fg-3)' }}>
                      /{b.slug} · {b.ownerEmail ?? 'no owner'}
                    </p>
                  </div>
                  <span className="caption" style={{ color: 'var(--fg-3)' }}>
                    {new Date(b.createdAt).toLocaleDateString()}
                  </span>
                  {expanded === b.id ? <ChevronUp size={16} color="var(--fg-3)" /> : <ChevronDown size={16} color="var(--fg-3)" />}
                </div>

                {expanded === b.id && (
                  <div style={{ padding: '12px 20px 20px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-muted)' }}>
                    <AssignStaffForm businessId={b.id} toast={toast} qc={qc} />
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <p className="body" style={{ padding: 24, color: 'var(--fg-3)' }}>No businesses found.</p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

function AssignStaffForm({
  businessId, toast, qc,
}: {
  businessId: string;
  toast: ReturnType<typeof useToast>;
  qc: ReturnType<typeof useQueryClient>;
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'manager' | 'staff'>('staff');

  const mut = useMutation({
    mutationFn: () =>
      api(`/api/admin/businesses/${businessId}/staff`, { method: 'POST', body: { email: email.trim(), role } }),
    onSuccess: () => {
      toast.success(`Added ${email.trim()} as ${role}`);
      setEmail('');
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Could not assign staff'),
  });

  return (
    <div>
      <p className="label" style={{ marginBottom: 10 }}>Assign staff to this business</p>
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 220px' }}>
          <Input
            label="User email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
          />
        </div>
        <div>
          <p className="label" style={{ marginBottom: 6 }}>Role</p>
          <select value={role} onChange={(e) => setRole(e.target.value as 'manager' | 'staff')} style={{ ...selectStyle, height: 44 }}>
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
          </select>
        </div>
        <Button
          onClick={() => { if (email.trim()) mut.mutate(); }}
          loading={mut.isPending}
          disabled={!email.trim()}
        >
          <UserPlus size={16} /> Assign
        </Button>
      </div>
    </div>
  );
}
