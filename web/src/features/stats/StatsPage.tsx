import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../../lib/api';
import { getActiveBusinessId } from '../../lib/activeBusiness';
import { Card } from '../../components/Card';
import { KpiCard } from '../../components/KpiCard';
import { Leaderboard } from '../../components/Leaderboard';
import { DateRangePicker, defaultDateRange } from '../../components/DateRangePicker';

type Summary = {
  range: { from: string; to: string };
  totalVisits: number;
  uniqueCustomers: number;
  newMembers: number;
  totalRedemptions: number;
  avgVisitsPerCustomer: number;
};

type Daily = {
  range: { from: string; to: string };
  series: Array<{ day: string; visits: number }>;
};

type TopCustomer = {
  customerId: string;
  displayName: string;
  email: string;
  visits: number;
  lastVisitAt: string;
};

export function StatsPage() {
  const businessId = getActiveBusinessId();
  const [range, setRange] = useState(defaultDateRange());

  const summary = useQuery({
    queryKey: ['stats', 'summary', businessId, range],
    queryFn: () =>
      api<Summary>(`/api/businesses/${businessId}/stats/summary`, {
        query: { from: range.from, to: range.to },
      }),
    enabled: !!businessId,
  });

  const daily = useQuery({
    queryKey: ['stats', 'daily', businessId, range],
    queryFn: () =>
      api<Daily>(`/api/businesses/${businessId}/stats/visits-daily`, {
        query: { from: range.from, to: range.to },
      }),
    enabled: !!businessId,
  });

  const top = useQuery({
    queryKey: ['stats', 'top', businessId, range],
    queryFn: () =>
      api<TopCustomer[]>(`/api/businesses/${businessId}/stats/top-customers`, {
        query: { from: range.from, to: range.to, limit: 10 },
      }),
    enabled: !!businessId,
  });

  if (!businessId) {
    return (
      <Card>
        <h2 className="h2">Pick a business to manage</h2>
        <p className="body" style={{ color: 'var(--fg-2)', marginTop: 12 }}>
          Open <Link to="/admin/business">the business profile page</Link> to create or select one.
        </p>
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16 }}>
        <div>
          <span className="label">Dashboard</span>
          <h1 className="display-2" style={{ marginTop: 8 }}>How are we doing?</h1>
        </div>
        <DateRangePicker from={range.from} to={range.to} onChange={setRange} />
      </header>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 16,
        }}
      >
        <KpiCard label="Visits" value={summary.data?.totalVisits ?? '-'} />
        <KpiCard label="Unique customers" value={summary.data?.uniqueCustomers ?? '-'} />
        <KpiCard label="New members" value={summary.data?.newMembers ?? '-'} />
        <KpiCard label="Redemptions" value={summary.data?.totalRedemptions ?? '-'} />
        <KpiCard
          label="Avg visits / customer"
          value={summary.data?.avgVisitsPerCustomer ?? '-'}
        />
      </section>

      <section>
        <Card>
          <h2 className="h2" style={{ marginBottom: 16 }}>Visits over time</h2>
          {daily.isLoading ? (
            <p className="body">Loading…</p>
          ) : (daily.data?.series.length ?? 0) === 0 ? (
            <p className="body" style={{ color: 'var(--fg-3)' }}>No data in this window.</p>
          ) : (
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <LineChart data={daily.data?.series ?? []} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="var(--slate-200)" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: 'var(--fg-3)', fontFamily: 'var(--font-mono)', fontSize: 11 }}
                    stroke="var(--slate-300)"
                  />
                  <YAxis
                    tick={{ fill: 'var(--fg-3)', fontFamily: 'var(--font-mono)', fontSize: 11 }}
                    stroke="var(--slate-300)"
                    allowDecimals={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-default)',
                      borderRadius: 4,
                      fontFamily: 'var(--font-body)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="visits"
                    stroke="var(--action)"
                    strokeWidth={2}
                    dot={{ r: 3, fill: 'var(--action)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </section>

      <Leaderboard
        title="Top customers"
        rows={(top.data ?? []).map((r) => ({
          id: r.customerId,
          name: r.displayName,
          detail: r.email,
          value: r.visits,
        }))}
      />
    </div>
  );
}
