import React, { useState } from 'react';
import { ScrollView, View, Pressable, type ViewStyle } from 'react-native';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { Clock } from 'lucide-react-native';
import { api } from '../../src/lib/api';
import { Card } from '../../src/components/Card';
import { Typo } from '../../src/components/Heading';
import { tokens } from '../../src/design-system/tokens';

type Visit = {
  visitId: string;
  businessName: string;
  businessSlug: string;
  scannedAt: string;
};

type VisitsPageData = {
  total: number;
  limit: number;
  offset: number;
  items: Visit[];
};

const PAGE_SIZE = 10;
const REWARDS_PER_PAGE = 5;

type Membership = {
  membershipId: string;
  business: { id: string; name: string };
  totalVisits: number;
  visitsSinceLastRedemption: number;
  program: null | {
    requiredVisits: number;
    rewardDescription: string;
    rewardEligible: boolean;
    expiresAt: string | null;
  };
};

function fmtDeadline(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function Visits() {
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
  const items = visits.data?.items ?? [];

  return (
    <ScrollView
      style={{ backgroundColor: tokens.colors.bgCanvas }}
      contentContainerStyle={{ padding: 20, gap: 32 }}
    >
      <View>
        <Typo variant="label" color={tokens.colors.fg2}>History</Typo>
        <Typo variant="display2" style={{ marginTop: 8 }}>
          Your visits
        </Typo>
      </View>

      <View>
        <Typo variant="h2" style={{ marginBottom: 12 }}>Rewards in progress</Typo>
        {(() => {
          const rewards = (memberships.data ?? []).filter((m: Membership) => m.program);
          if (rewards.length === 0) {
            return (
              <Typo variant="body" color={tokens.colors.fg3}>
                No active rewards yet.
              </Typo>
            );
          }
          const totalRewardPages = Math.max(1, Math.ceil(rewards.length / REWARDS_PER_PAGE));
          const rp = Math.min(rewardsPage, totalRewardPages - 1);
          const rStart = rp * REWARDS_PER_PAGE;
          const visibleRewards = rewards.slice(rStart, rStart + REWARDS_PER_PAGE);
          return (
            <>
              <View style={{ gap: 12 }}>
                {visibleRewards.map((m: Membership) => (
                  <Card key={m.membershipId}>
                    <Typo variant="h3">{m.business.name}</Typo>
                    <View style={{ marginTop: 12 }}>
                      <View
                        style={{
                          height: 8,
                          backgroundColor: tokens.colors.slate200,
                          borderRadius: 4,
                          overflow: 'hidden',
                        }}
                      >
                        <View
                          style={{
                            width: `${Math.min(100, (m.visitsSinceLastRedemption / m.program!.requiredVisits) * 100)}%`,
                            height: '100%',
                            backgroundColor: m.program!.rewardEligible
                              ? tokens.colors.success
                              : tokens.colors.cyan500,
                          }}
                        />
                      </View>
                      <Typo variant="caption" color={tokens.colors.fg2} style={{ marginTop: 6 }}>
                        {m.program!.rewardEligible
                          ? 'Reward ready!'
                          : `${m.visitsSinceLastRedemption} / ${m.program!.requiredVisits} — ${m.program!.rewardDescription}`}
                      </Typo>
                      {m.program!.expiresAt && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                          <Clock color={tokens.colors.fg3} size={12} />
                          <Typo variant="caption" color={tokens.colors.fg3}>
                            Reward ends {fmtDeadline(m.program!.expiresAt)}
                          </Typo>
                        </View>
                      )}
                    </View>
                  </Card>
                ))}
              </View>
              {totalRewardPages > 1 && (
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: 12,
                  }}
                >
                  <Typo variant="caption" color={tokens.colors.fg3}>
                    {rStart + 1}–{Math.min(rStart + REWARDS_PER_PAGE, rewards.length)} of {rewards.length}
                  </Typo>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Pressable
                      disabled={rp === 0}
                      onPress={() => setRewardsPage((p) => Math.max(0, p - 1))}
                      style={pagerStyle(rp === 0)}
                    >
                      <Typo variant="bodySm" color={rp === 0 ? tokens.colors.fg3 : tokens.colors.fg1}>
                        Prev
                      </Typo>
                    </Pressable>
                    <Pressable
                      disabled={rp >= totalRewardPages - 1}
                      onPress={() => setRewardsPage((p) => p + 1)}
                      style={pagerStyle(rp >= totalRewardPages - 1)}
                    >
                      <Typo
                        variant="bodySm"
                        color={rp >= totalRewardPages - 1 ? tokens.colors.fg3 : tokens.colors.fg1}
                      >
                        Next
                      </Typo>
                    </Pressable>
                  </View>
                </View>
              )}
            </>
          );
        })()}
      </View>

      <View>
        <Typo variant="h2" style={{ marginBottom: 12 }}>Recent visits</Typo>
        <Card padding={0}>
          {total === 0 && (
            <View style={{ padding: 16 }}>
              <Typo variant="body" color={tokens.colors.fg3}>No visits yet.</Typo>
            </View>
          )}
          {items.map((v: Visit, i: number) => (
            <View
              key={v.visitId}
              style={{
                padding: 16,
                borderBottomWidth: i === items.length - 1 ? 0 : 1,
                borderColor: tokens.colors.borderSubtle,
              }}
            >
              <Typo variant="body" style={{ fontWeight: '600' }}>{v.businessName}</Typo>
              <Typo variant="caption" color={tokens.colors.fg3} style={{ marginTop: 2 }}>
                {new Date(v.scannedAt).toLocaleString()}
              </Typo>
            </View>
          ))}
          {total > 0 && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: 16,
                borderTopWidth: 1,
                borderColor: tokens.colors.borderSubtle,
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
          )}
        </Card>
      </View>
    </ScrollView>
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
