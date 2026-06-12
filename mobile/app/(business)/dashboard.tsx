import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../src/lib/api';
import { resolveActiveBusinessId } from '../../src/lib/activeBusiness';
import { Card } from '../../src/components/Card';
import { KpiCard } from '../../src/components/KpiCard';
import { Typo } from '../../src/components/Heading';
import { tokens } from '../../src/design-system/tokens';

type Summary = {
  totalVisits: number;
  uniqueCustomers: number;
  newMembers: number;
  totalRedemptions: number;
  avgVisitsPerCustomer: number;
};

type TopCustomer = {
  customerId: string;
  displayName: string;
  email: string;
  visits: number;
};

function defaultRange() {
  const now = new Date();
  const past = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return { from: past.toISOString().slice(0, 10), to: now.toISOString().slice(0, 10) };
}

export default function Dashboard() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [resolving, setResolving] = useState(true);

  useEffect(() => {
    resolveActiveBusinessId().then((id) => {
      setBusinessId(id);
      setResolving(false);
    });
  }, []);

  const range = defaultRange();
  const summary = useQuery({
    queryKey: ['stats', 'summary', businessId, range],
    queryFn: () =>
      api<Summary>(`/api/businesses/${businessId}/stats/summary`, {
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

  if (resolving) return null;

  if (!businessId) {
    return (
      <ScrollView style={{ backgroundColor: tokens.colors.bgCanvas }} contentContainerStyle={{ padding: 20 }}>
        <Card>
          <Typo variant="h2">No business found</Typo>
          <Typo variant="body" color={tokens.colors.fg2} style={{ marginTop: 8 }}>
            Go to the Business tab to create your business.
          </Typo>
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={{ backgroundColor: tokens.colors.bgCanvas }} contentContainerStyle={{ padding: 20, gap: 16 }}>
      <View>
        <Typo variant="label" color={tokens.colors.fg2}>Last 30 days</Typo>
        <Typo variant="display2" style={{ marginTop: 8 }}>
          Dashboard
        </Typo>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        <KpiCard label="Visits" value={summary.data?.totalVisits ?? '—'} />
        <KpiCard label="Customers" value={summary.data?.uniqueCustomers ?? '—'} />
        <KpiCard label="New members" value={summary.data?.newMembers ?? '—'} />
        <KpiCard label="Redemptions" value={summary.data?.totalRedemptions ?? '—'} />
        <KpiCard label="Avg / customer" value={summary.data?.avgVisitsPerCustomer ?? '—'} />
      </View>

      <Card>
        <Typo variant="h2" style={{ marginBottom: 12 }}>Top customers</Typo>
        {top.data?.length === 0 && (
          <Typo variant="body" color={tokens.colors.fg3}>No data yet.</Typo>
        )}
        <View style={{ gap: 8 }}>
          {top.data?.map((c: TopCustomer, i: number) => (
            <View
              key={c.customerId}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                padding: 12,
                borderRadius: tokens.radius.lg,
                backgroundColor: i === 0 ? tokens.colors.cyan50 : 'transparent',
              }}
            >
              <Typo variant="num" color={tokens.colors.fg3} style={{ width: 24, textAlign: 'right' }}>
                {i + 1}
              </Typo>
              <View style={{ flex: 1 }}>
                <Typo variant="body">{c.displayName}</Typo>
                <Typo variant="caption" color={tokens.colors.fg3}>{c.email}</Typo>
              </View>
              <Typo variant="numLg">{c.visits}</Typo>
            </View>
          ))}
        </View>
      </Card>
    </ScrollView>
  );
}
