import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Gift, History } from 'lucide-react';
import { api } from '../../lib/api';
import { Card } from '../../components/Card';

type Visit = {
  visitId: string;
  businessId: string;
  businessSlug: string;
  businessName: string;
  scannedAt: string;
};

type Membership = {
  membershipId: string;
  business: { id: string; slug: string; name: string };
  totalVisits: number;
  visitsSinceLastRedemption: number;
  program: null | {
    requiredVisits: number;
    rewardDescription: string;
  };
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

export function VisitsPage() {
  const visits = useQuery({ queryKey: ['my-visits'], queryFn: () => api<Visit[]>('/api/me/visits') });
  const memberships = useQuery({
    queryKey: ['my-memberships'],
    queryFn: () => api<Membership[]>('/api/me/memberships'),
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <header>
        <span className="label">History</span>
        <h1 className="display-2" style={{ marginTop: 8 }}>
          Your visits & rewards
        </h1>
        <p className="body-lg" style={{ color: 'var(--fg-2)', marginTop: 8 }}>
          A timeline of every coffee, croissant, and stamp.
        </p>
      </header>

      <section>
        <h2 className="h2" style={{ marginBottom: 16 }}>
          <Gift size={20} style={{ verticalAlign: 'middle', marginRight: 6, color: 'var(--cyan-500)' }} />
          Rewards in progress
        </h2>
        {memberships.isLoading && <p className="body">Loading…</p>}
        {memberships.data && memberships.data.length === 0 && (
          <p className="body" style={{ color: 'var(--fg-3)' }}>
            You haven't joined any shop yet. <Link to="/">Explore the network</Link>.
          </p>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {memberships.data
            ?.filter((m) => m.program)
            .map((m) => (
              <Card key={m.membershipId}>
                <h3 className="h3">{m.business.name}</h3>
                <p className="caption" style={{ marginTop: 4, color: 'var(--fg-3)' }}>
                  {m.totalVisits} visits all-time
                </p>
                <div style={{ marginTop: 12 }}>
                  <div
                    style={{
                      height: 8,
                      background: 'var(--slate-200)',
                      borderRadius: 4,
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(100, (m.visitsSinceLastRedemption / m.program!.requiredVisits) * 100)}%`,
                        height: '100%',
                        background: 'var(--cyan-500)',
                      }}
                    />
                  </div>
                  <p className="caption" style={{ marginTop: 6 }}>
                    {m.visitsSinceLastRedemption} / {m.program!.requiredVisits} -{' '}
                    {m.program!.rewardDescription}
                  </p>
                </div>
              </Card>
            ))}
        </div>
      </section>

      <section>
        <h2 className="h2" style={{ marginBottom: 16 }}>
          <History size={20} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          Recent visits
        </h2>
        {visits.isLoading && <p className="body">Loading…</p>}
        {visits.data && visits.data.length === 0 && (
          <p className="body" style={{ color: 'var(--fg-3)' }}>No visits yet.</p>
        )}
        <Card padding={0}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {visits.data?.map((v) => (
              <li
                key={v.visitId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 20px',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <div>
                  <Link
                    to={`/b/${v.businessSlug}`}
                    style={{ font: 'var(--t-body)', fontWeight: 600, color: 'var(--fg-1)', textDecoration: 'none' }}
                  >
                    {v.businessName}
                  </Link>
                  <p className="caption" style={{ color: 'var(--fg-3)' }}>
                    {fmtDate(v.scannedAt)}
                  </p>
                </div>
                <span className="brand-stamp" />
              </li>
            ))}
          </ul>
        </Card>
      </section>
    </div>
  );
}
