import React, { useEffect, useState } from 'react';
import { ScrollView, View, Pressable, type ViewStyle } from 'react-native';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { ChevronDown } from 'lucide-react-native';
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

type VisitsPage = {
  total: number;
  limit: number;
  offset: number;
  items: Array<{ visitId: string; scannedAt: string }>;
};

const PAGE_SIZE = 10;

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString();
}

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
        <View style={{ gap: 6 }}>
          {top.data?.map((c: TopCustomer, i: number) => (
            <TopCustomerRow
              key={c.customerId}
              rank={i + 1}
              customer={c}
              businessId={businessId}
              range={range}
            />
          ))}
        </View>
      </Card>
    </ScrollView>
  );
}

/**
 * One top-customer row as an accordion: tapping it expands to show that
 * customer's visits at this business, 10 at a time with prev/next pagination.
 * Visits are fetched lazily (only when expanded) and scoped to the dashboard's
 * date range.
 */
function TopCustomerRow({
  rank,
  customer,
  businessId,
  range,
}: {
  rank: number;
  customer: TopCustomer;
  businessId: string;
  range: { from: string; to: string };
}) {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);

  const visits = useQuery({
    queryKey: ['customer-visits', businessId, customer.customerId, range, page],
    queryFn: () =>
      api<VisitsPage>(
        `/api/businesses/${businessId}/stats/top-customers/${customer.customerId}/visits`,
        { query: { from: range.from, to: range.to, limit: PAGE_SIZE, offset: page * PAGE_SIZE } },
      ),
    enabled: open,
    placeholderData: keepPreviousData,
  });

  const total = visits.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <View
      style={{
        borderRadius: tokens.radius.lg,
        borderWidth: 1,
        borderColor: tokens.colors.borderDefault,
        overflow: 'hidden',
      }}
    >
      <Pressable
        onPress={() => setOpen((o) => !o)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          padding: 12,
          backgroundColor: tokens.colors.bgCard,
        }}
      >
        <Typo variant="num" color={tokens.colors.fg3} style={{ width: 24, textAlign: 'right' }}>
          {rank}
        </Typo>
        <View style={{ flex: 1 }}>
          <Typo variant="body" color={tokens.colors.fg1}>
            {customer.displayName}
          </Typo>
          <Typo variant="caption" color={tokens.colors.fg3}>
            {customer.email}
          </Typo>
        </View>
        <Typo variant="numLg" color={tokens.colors.fg1}>
          {customer.visits}
        </Typo>
        <ChevronDown
          size={16}
          color={tokens.colors.fg3}
          style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}
        />
      </Pressable>

      {open && (
        <View
          style={{
            backgroundColor: tokens.colors.bgCanvas,
            paddingHorizontal: 12,
            paddingBottom: 12,
            paddingTop: 4,
          }}
        >
          {visits.isLoading ? (
            <Typo variant="caption" color={tokens.colors.fg3} style={{ paddingVertical: 8 }}>
              Loading visits…
            </Typo>
          ) : total === 0 ? (
            <Typo variant="caption" color={tokens.colors.fg3} style={{ paddingVertical: 8 }}>
              No visits in this period.
            </Typo>
          ) : (
            <>
              {visits.data?.items.map((v) => (
                <View
                  key={v.visitId}
                  style={{
                    paddingVertical: 9,
                    borderBottomWidth: 1,
                    borderBottomColor: tokens.colors.borderSubtle,
                  }}
                >
                  <Typo variant="bodySm" color={tokens.colors.fg2}>
                    {fmtDate(v.scannedAt)}
                  </Typo>
                </View>
              ))}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 10,
                }}
              >
                <Typo variant="caption" color={tokens.colors.fg3}>
                  {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}
                </Typo>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Pressable
                    disabled={page === 0}
                    onPress={() => setPage((p) => Math.max(0, p - 1))}
                    style={pagerStyle(page === 0)}
                  >
                    <Typo variant="bodySm" color={page === 0 ? tokens.colors.fg3 : tokens.colors.fg1}>
                      Prev
                    </Typo>
                  </Pressable>
                  <Pressable
                    disabled={page >= totalPages - 1}
                    onPress={() => setPage((p) => p + 1)}
                    style={pagerStyle(page >= totalPages - 1)}
                  >
                    <Typo
                      variant="bodySm"
                      color={page >= totalPages - 1 ? tokens.colors.fg3 : tokens.colors.fg1}
                    >
                      Next
                    </Typo>
                  </Pressable>
                </View>
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
}

function pagerStyle(disabled: boolean): ViewStyle {
  return {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: tokens.radius.md,
    borderWidth: 1,
    borderColor: tokens.colors.borderDefault,
    backgroundColor: tokens.colors.bgCard,
    opacity: disabled ? 0.5 : 1,
  };
}
