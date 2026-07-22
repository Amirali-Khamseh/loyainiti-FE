import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Clock, Gift, History } from 'lucide-react';
import { api } from '../../lib/api';
import { Card } from '../../components/Card';
import { LoyaltyStamp } from '../../components/LoyaltyStamp';

type Visit = {
  visitId: string;
  businessId: string;
  businessSlug: string;
  businessName: string;
  scannedAt: string;
};

type VisitsPageData = {
  total: number;
  limit: number;
  offset: number;
  items: Visit[];
};

const PAGE_SIZE = 5;

type Membership = {
  membershipId: string;
  business: { id: string; slug: string; name: string };
  totalVisits: number;
  visitsSinceLastRedemption: number;
  program: null | {
    requiredVisits: number;
    rewardDescription: string;
    rewardEligible: boolean;
    expiresAt: string | null;
  };
};

const REWARDS_PER_PAGE = 5;

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

function fmtDeadline(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function VisitsPage() {
  const [page, setPage] = useState(0);
  const [rewardsPage, setRewardsPage] = useState(0);
  const visits = useQuery({
    queryKey: ['my-visits', page],
    queryFn: () =>
      api<VisitsPageData>('/api/me/visits', {
        query: { limit: PAGE_SIZE, offset: page * PAGE_SIZE },
      }),
    placeholderData: keepPreviousData,
  });
  const memberships = useQuery({
    queryKey: ['my-memberships'],
    queryFn: () => api<Membership[]>('/api/me/memberships'),
  });

  const total = visits.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

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
            You haven't joined any shop yet. <Link to="/explore">Explore the network</Link>.
          </p>
        )}
        {(() => {
          const rewards = (memberships.data ?? []).filter((m) => m.program);
          const totalRewardPages = Math.max(1, Math.ceil(rewards.length / REWARDS_PER_PAGE));
          const rp = Math.min(rewardsPage, totalRewardPages - 1);
          const rStart = rp * REWARDS_PER_PAGE;
          const visibleRewards = rewards.slice(rStart, rStart + REWARDS_PER_PAGE);
          return (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
                {visibleRewards.map((m) => (
                  <Card key={m.membershipId}>
                    <h3 className="h3">{m.business.name}</h3>
                    <p className="caption" style={{ marginTop: 4, color: 'var(--fg-3)' }}>
                      {m.totalVisits} visits all-time
                    </p>
                    <div style={{ marginTop: 12 }}>
                      <LoyaltyStamp
                        required={m.program!.requiredVisits}
                        earned={m.visitsSinceLastRedemption}
                        rewardLabel={m.program!.rewardDescription}
                      />
                      {m.program!.expiresAt && (
                        <p className="caption" style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--fg-3)' }}>
                          <Clock size={12} style={{ flexShrink: 0 }} />
                          Reward ends {fmtDeadline(m.program!.expiresAt)}
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
              {totalRewardPages > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                  <span className="caption" style={{ color: 'var(--fg-3)' }}>
                    {rStart + 1}–{Math.min(rStart + REWARDS_PER_PAGE, rewards.length)} of {rewards.length}
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button type="button" disabled={rp === 0} onClick={() => setRewardsPage((p) => Math.max(0, p - 1))} style={pagerBtn(rp === 0)}>
                      Prev
                    </button>
                    <button type="button" disabled={rp >= totalRewardPages - 1} onClick={() => setRewardsPage((p) => p + 1)} style={pagerBtn(rp >= totalRewardPages - 1)}>
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          );
        })()}
      </section>

      <section>
        <h2 className="h2" style={{ marginBottom: 16 }}>
          <History size={20} style={{ verticalAlign: 'middle', marginRight: 6 }} />
          Recent visits
        </h2>
        {visits.isLoading && <p className="body">Loading…</p>}
        {visits.data && total === 0 && (
          <p className="body" style={{ color: 'var(--fg-3)' }}>No visits yet.</p>
        )}
        {total > 0 && (
          <Card padding={0}>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {visits.data?.items.map((v) => (
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
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 20px',
                borderTop: '1px solid var(--border-subtle)',
              }}
            >
              <span className="caption" style={{ color: 'var(--fg-3)' }}>
                {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  disabled={page === 0}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  style={pagerBtn(page === 0)}
                >
                  Prev
                </button>
                <button
                  type="button"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  style={pagerBtn(page >= totalPages - 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </Card>
        )}
      </section>
    </div>
  );
}

function pagerBtn(disabled: boolean): React.CSSProperties {
  return {
    font: 'var(--t-body-sm)',
    padding: '6px 12px',
    borderRadius: 8,
    border: '1px solid var(--border-default)',
    background: 'var(--bg-card)',
    color: disabled ? 'var(--fg-3)' : 'var(--fg-1)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  };
}
