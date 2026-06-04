import React, { useState } from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { Lock } from 'lucide-react-native';
import { api, ApiError } from '../../../src/lib/api';
import { auth } from '../../../src/lib/auth';
import { Card } from '../../../src/components/Card';
import { Typo } from '../../../src/components/Heading';
import { LoyaltyStamp } from '../../../src/components/LoyaltyStamp';
import { tokens } from '../../../src/design-system/tokens';

type Business = { id: string; slug: string; name: string; description: string | null; address: string | null };
type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  currency: string;
};
type MenuTree = {
  menu: {
    id: string;
    title: string;
    categories: Array<{ id: string; name: string; items: MenuItem[] }>;
  };
};
type LoyaltyProgram = { id: string; name: string; requiredVisits: number; rewardDescription: string; isActive: boolean };
type Membership = {
  membershipId: string;
  business: { id: string };
  visitsSinceLastRedemption: number;
  program: null | { requiredVisits: number };
};

type Tab = 'public' | 'member' | 'rewards';

export default function ShopDetail() {
  const { slug = '' } = useLocalSearchParams<{ slug: string }>();
  const [tab, setTab] = useState<Tab>('public');
  const { data: session } = auth.useSession();

  const business = useQuery({ queryKey: ['business', slug], queryFn: () => api<Business>(`/api/b/${slug}`) });
  const publicMenu = useQuery({
    queryKey: ['menu', slug, 'public'],
    queryFn: () => api<MenuTree>(`/api/b/${slug}/menu`),
  });
  const memberMenu = useQuery({
    queryKey: ['menu', slug, 'member'],
    queryFn: () => api<MenuTree>(`/api/b/${slug}/menu/member`),
    enabled: !!session && tab === 'member',
    retry: false,
  });
  const programs = useQuery({
    queryKey: ['loyalty-programs', business.data?.id],
    queryFn: () => api<LoyaltyProgram[]>(`/api/businesses/${business.data!.id}/loyalty-programs`),
    enabled: !!business.data,
  });
  const memberships = useQuery({
    queryKey: ['my-memberships'],
    queryFn: () => api<Membership[]>('/api/me/memberships'),
    enabled: !!session,
  });

  if (!business.data) return null;
  const active = programs.data?.find((p) => p.isActive);
  const membership = memberships.data?.find((m) => m.business.id === business.data?.id);
  const memberLocked = memberMenu.error instanceof ApiError && memberMenu.error.status === 403;

  return (
    <ScrollView style={{ backgroundColor: tokens.colors.bgCanvas }} contentContainerStyle={{ padding: 20, gap: 20 }}>
      <View>
        <Typo variant="label" color={tokens.colors.fg2}>{business.data.slug}</Typo>
        <Typo variant="display2" style={{ marginTop: 8 }}>
          {business.data.name}
        </Typo>
        {business.data.description && (
          <Typo variant="bodyLg" color={tokens.colors.fg2} style={{ marginTop: 8 }}>
            {business.data.description}
          </Typo>
        )}
        {business.data.address && (
          <Typo variant="caption" color={tokens.colors.fg3} style={{ marginTop: 4 }}>
            {business.data.address}
          </Typo>
        )}
      </View>

      <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: tokens.colors.borderSubtle }}>
        {(['public', 'member', 'rewards'] as Tab[]).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderBottomWidth: tab === t ? 2 : 0,
              borderColor: tokens.colors.action,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Typo variant="body" color={tab === t ? tokens.colors.action : tokens.colors.fg2}>
                {t === 'public' ? 'Public' : t === 'member' ? 'Member' : 'Rewards'}
              </Typo>
              {t === 'member' && !membership && <Lock size={14} color={tokens.colors.fg3} />}
            </View>
          </Pressable>
        ))}
      </View>

      {tab === 'public' && <MenuTreeView tree={publicMenu.data} />}

      {tab === 'member' && (
        <>
          {!session && (
            <Card>
              <Typo variant="h3">Sign in to see the member menu</Typo>
            </Card>
          )}
          {session && memberLocked && (
            <Card>
              <Typo variant="h3">Not a member yet</Typo>
              <Typo variant="body" color={tokens.colors.fg2} style={{ marginTop: 8 }}>
                Your membership starts on visit #1.
              </Typo>
            </Card>
          )}
          {session && !memberLocked && <MenuTreeView tree={memberMenu.data} />}
        </>
      )}

      {tab === 'rewards' && (
        <View style={{ gap: 12 }}>
          <Card>
            <Typo variant="h3">{active ? active.name : 'No active reward'}</Typo>
            {active ? (
              <>
                <Typo variant="body" color={tokens.colors.fg2} style={{ marginTop: 8 }}>
                  {active.rewardDescription}
                </Typo>
                <Typo variant="caption" style={{ marginTop: 12 }}>
                  Earn {active.requiredVisits} stamps to unlock.
                </Typo>
              </>
            ) : (
              <Typo variant="body" color={tokens.colors.fg2} style={{ marginTop: 8 }}>
                This shop hasn't set up a loyalty programme.
              </Typo>
            )}
          </Card>
          {active && membership && (
            <Card>
              <Typo variant="h3">Your progress</Typo>
              <View style={{ marginTop: 16 }}>
                <LoyaltyStamp
                  required={active.requiredVisits}
                  earned={membership.visitsSinceLastRedemption}
                  rewardLabel={active.rewardDescription}
                />
              </View>
            </Card>
          )}
        </View>
      )}
    </ScrollView>
  );
}

function MenuTreeView({ tree }: { tree: MenuTree | undefined }) {
  if (!tree) return <Typo variant="body" color={tokens.colors.fg3}>No menu published.</Typo>;
  return (
    <View style={{ gap: 24 }}>
      {tree.menu.categories.map((cat) => (
        <View key={cat.id}>
          <Typo variant="h3" style={{ marginBottom: 12 }}>{cat.name}</Typo>
          <View style={{ gap: 8 }}>
            {cat.items.map((it) => (
              <View
                key={it.id}
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  padding: 14,
                  borderRadius: tokens.radius.lg,
                  borderWidth: 1,
                  borderColor: tokens.colors.borderSubtle,
                  backgroundColor: tokens.colors.bgCard,
                }}
              >
                <View style={{ flex: 1, paddingRight: 12 }}>
                  <Typo variant="bodyLg" style={{ fontWeight: '600' }}>{it.name}</Typo>
                  {it.description && (
                    <Typo variant="bodySm" color={tokens.colors.fg2} style={{ marginTop: 4 }}>
                      {it.description}
                    </Typo>
                  )}
                </View>
                <Typo variant="numLg">
                  {new Intl.NumberFormat(undefined, { style: 'currency', currency: it.currency }).format(
                    it.priceCents / 100,
                  )}
                </Typo>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}
