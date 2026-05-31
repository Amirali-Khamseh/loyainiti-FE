import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2, UserPlus } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { getActiveBusinessId } from '../../lib/activeBusiness';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
import { useToast } from '../../components/Toast';

type StaffRole = 'owner' | 'manager' | 'staff';
type StaffMember = {
  userId: string;
  name: string;
  email: string;
  role: StaffRole;
  joinedAt: string;
};

export function StaffPage() {
  const businessId = getActiveBusinessId();
  const qc = useQueryClient();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'manager' | 'staff'>('staff');

  const staff = useQuery({
    queryKey: ['staff', businessId],
    queryFn: () => api<StaffMember[]>(`/api/businesses/${businessId}/staff`),
    enabled: !!businessId,
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ['staff', businessId] });

  const inviteMut = useMutation({
    mutationFn: () =>
      api(`/api/businesses/${businessId}/staff`, {
        method: 'POST',
        body: { email: email.trim(), role: inviteRole },
      }),
    onSuccess: () => {
      toast.success('Team member added');
      setEmail('');
      invalidate();
    },
    onError: (e) =>
      toast.error(e instanceof ApiError ? e.message : 'Could not add that person'),
  });

  const roleMut = useMutation({
    mutationFn: (vars: { userId: string; role: 'manager' | 'staff' }) =>
      api(`/api/businesses/${businessId}/staff/${vars.userId}`, {
        method: 'PATCH',
        body: { role: vars.role },
      }),
    onSuccess: () => {
      toast.success('Role updated');
      invalidate();
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Could not update role'),
  });

  const removeMut = useMutation({
    mutationFn: (userId: string) =>
      api(`/api/businesses/${businessId}/staff/${userId}`, { method: 'DELETE' }),
    onSuccess: () => {
      toast.success('Removed');
      invalidate();
    },
    onError: (e) => toast.error(e instanceof ApiError ? e.message : 'Could not remove'),
  });

  if (!businessId) {
    return (
      <Card>
        <h2 className="h2">No active business</h2>
        <p className="body" style={{ color: 'var(--fg-2)', marginTop: 8 }}>
          Create or select a business first.
        </p>
      </Card>
    );
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header>
        <span className="label">Team</span>
        <h1 className="display-2" style={{ marginTop: 8 }}>
          Staff &amp; roles
        </h1>
        <p className="body-lg" style={{ color: 'var(--fg-2)', marginTop: 8 }}>
          Invite employees by the email they signed up with. Managers can see the dashboard and
          stats; staff can scan and manage menus.
        </p>
      </header>

      <Card padding={24} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h3 className="h3">Invite a team member</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (email.trim()) inviteMut.mutate();
          }}
          style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}
        >
          <div style={{ flex: 1, minWidth: 220 }}>
            <Input
              label="Email"
              type="email"
              placeholder="employee@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <p className="label" style={{ marginBottom: 6 }}>
              Role
            </p>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as 'manager' | 'staff')}
              style={{
                height: 44,
                borderRadius: 12,
                border: '1px solid var(--border-default)',
                padding: '0 12px',
                font: 'var(--t-body)',
                background: 'var(--bg-card)',
                color: 'var(--fg-1)',
              }}
            >
              <option value="staff">Staff</option>
              <option value="manager">Manager</option>
            </select>
          </div>
          <Button type="submit" loading={inviteMut.isPending} disabled={!email.trim()}>
            <UserPlus size={16} /> Add
          </Button>
        </form>
      </Card>

      <Card padding={0}>
        {staff.isLoading ? (
          <p className="body" style={{ padding: 24 }}>
            Loading team…
          </p>
        ) : staff.error ? (
          <p className="body" style={{ padding: 24, color: 'var(--danger)' }}>
            {(staff.error as Error).message}
          </p>
        ) : (
          <div>
            {staff.data?.map((m, i) => (
              <div
                key={m.userId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: '16px 24px',
                  borderTop: i === 0 ? 'none' : '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{ font: 'var(--t-body)', fontWeight: 600, margin: 0 }}>{m.name}</p>
                  <p className="caption" style={{ color: 'var(--fg-3)' }}>
                    {m.email}
                  </p>
                </div>
                {m.role === 'owner' ? (
                  <span className="label" style={{ color: 'var(--action)' }}>
                    Owner
                  </span>
                ) : (
                  <>
                    <select
                      value={m.role}
                      onChange={(e) =>
                        roleMut.mutate({ userId: m.userId, role: e.target.value as 'manager' | 'staff' })
                      }
                      style={{
                        height: 38,
                        borderRadius: 10,
                        border: '1px solid var(--border-default)',
                        padding: '0 10px',
                        font: 'var(--t-body-sm)',
                        background: 'var(--bg-card)',
                        color: 'var(--fg-1)',
                      }}
                    >
                      <option value="staff">Staff</option>
                      <option value="manager">Manager</option>
                    </select>
                    <button
                      onClick={() => {
                        if (confirm(`Remove ${m.name} from the team?`)) removeMut.mutate(m.userId);
                      }}
                      aria-label={`Remove ${m.name}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        background: 'transparent',
                        border: '1px solid var(--border-default)',
                        borderRadius: 10,
                        padding: 8,
                        color: 'var(--danger)',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </>
                )}
              </div>
            ))}
            {staff.data?.length === 0 && (
              <p className="body" style={{ padding: 24, color: 'var(--fg-3)' }}>
                No team members yet.
              </p>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}
