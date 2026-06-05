import React from 'react';
import { ScrollView, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
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

type Membership = {
  membershipId: string;
  business: { id: string; name: string };
  totalVisits: number;
  visitsSinceLastRedemption: number;
  program: null | { requiredVisits: number; rewardDescription: string };
};

export default function Visits() {
  const visits = useQuery({ queryKey: ['my-visits'], queryFn: () => api<Visit[]>('/api/me/visits') });
  const memberships = useQuery({
    queryKey: ['my-memberships'],
    queryFn: () => api<Membership[]>('/api/me/memberships'),
  });

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
        <View style={{ gap: 12 }}>
          {memberships.data
            ?.filter((m: Membership) => m.program)
            .map((m: Membership) => (
              <Card key={m.membershipId}>
                <Typo variant="h3">{m.business.name}</Typo>
                <View style={{ marginTop: 12 }}>
                  <View
                    style={{
                      height: 8,
                      backgroundColor: tokens.colors.paper200,
                      borderRadius: 999,
                      overflow: 'hidden',
                    }}
                  >
                    <View
                      style={{
                        width: `${Math.min(100, (m.visitsSinceLastRedemption / m.program!.requiredVisits) * 100)}%`,
                        height: '100%',
                        backgroundColor: tokens.colors.gold500,
                      }}
                    />
                  </View>
                  <Typo variant="caption" color={tokens.colors.fg2} style={{ marginTop: 6 }}>
                    {m.visitsSinceLastRedemption} / {m.program!.requiredVisits} — {m.program!.rewardDescription}
                  </Typo>
                </View>
              </Card>
            ))}
          {memberships.data?.every((m: Membership) => !m.program) && (
            <Typo variant="body" color={tokens.colors.fg3}>
              No active rewards yet.
            </Typo>
          )}
        </View>
      </View>

      <View>
        <Typo variant="h2" style={{ marginBottom: 12 }}>Recent visits</Typo>
        <Card padding={0}>
          {visits.data?.length === 0 && (
            <View style={{ padding: 16 }}>
              <Typo variant="body" color={tokens.colors.fg3}>No visits yet.</Typo>
            </View>
          )}
          {visits.data?.map((v: Visit, i: number) => (
            <View
              key={v.visitId}
              style={{
                padding: 16,
                borderBottomWidth: i === (visits.data?.length ?? 0) - 1 ? 0 : 1,
                borderColor: tokens.colors.borderSubtle,
              }}
            >
              <Typo variant="body" style={{ fontWeight: '600' }}>{v.businessName}</Typo>
              <Typo variant="caption" color={tokens.colors.fg3} style={{ marginTop: 2 }}>
                {new Date(v.scannedAt).toLocaleString()}
              </Typo>
            </View>
          ))}
        </Card>
      </View>
    </ScrollView>
  );
}
