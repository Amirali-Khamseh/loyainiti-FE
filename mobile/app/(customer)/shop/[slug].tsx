import React, { useState } from 'react';
import { ScrollView, View, Pressable, Image } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { Lock } from 'lucide-react-native';
import { api, ApiError } from '../../../src/lib/api';
import { auth } from '../../../src/lib/auth';
import { r2Url } from '../../../src/lib/media';
import { Card } from '../../../src/components/Card';
import { Typo } from '../../../src/components/Heading';
import { LoyaltyStamp } from '../../../src/components/LoyaltyStamp';
import { tokens } from '../../../src/design-system/tokens';

type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
type DayHours = { open: string; close: string; closed: boolean };
type OpeningHours = Record<DayKey, DayHours>;
type Category = { id: string; name: string; slug: string };
type Photo = { id: string; r2Key: string; caption: string | null; sortOrder: number };

type Business = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  address: string | null;
  logoR2Key: string | null;
  coverR2Key: string | null;
  openingHours: OpeningHours | null;
  categories: Category[];
  photos: Photo[];
};

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
type LoyaltyProgram = {
  id: string;
  name: string;
  requiredVisits: number;
  rewardDescription: string;
  isActive: boolean;
};
type Membership = {
  membershipId: string;
  business: { id: string };
  visitsSinceLastRedemption: number;
  program: null | { requiredVisits: number };
};

type Tab = 'public' | 'member' | 'rewards';

const DAYS: [DayKey, string][] = [
  ['mon', 'Monday'],
  ['tue', 'Tuesday'],
  ['wed', 'Wednesday'],
  ['thu', 'Thursday'],
  ['fri', 'Friday'],
  ['sat', 'Saturday'],
  ['sun', 'Sunday'],
];

export default function ShopDetail() {
  const { slug = '' } = useLocalSearchParams<{ slug: string }>();
  const [tab, setTab] = useState<Tab>('public');
  const { data: session } = auth.useSession();

  const business = useQuery({
    queryKey: ['business', slug],
    queryFn: () => api<Business>(`/api/b/${slug}`),
  });
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
    queryFn: () =>
      api<LoyaltyProgram[]>(`/api/businesses/${business.data!.id}/loyalty-programs`),
    enabled: !!business.data,
  });
  const memberships = useQuery({
    queryKey: ['my-memberships'],
    queryFn: () => api<Membership[]>('/api/me/memberships'),
    enabled: !!session,
  });

  if (!business.data) return null;
  const b = business.data;
  const active = programs.data?.find((p: LoyaltyProgram) => p.isActive);
  const membership = memberships.data?.find((m: Membership) => m.business.id === b.id);
  const memberLocked = memberMenu.error instanceof ApiError && memberMenu.error.status === 403;
  const coverUrl = r2Url(b.coverR2Key);
  const logoUrl = r2Url(b.logoR2Key);

  return (
    <ScrollView
      style={{ backgroundColor: tokens.colors.bgCanvas }}
      contentContainerStyle={{ padding: 20, gap: 20 }}
    >
      {/* Cover photo */}
      {coverUrl && (
        <Image
          source={{ uri: coverUrl }}
          style={{ width: '100%', height: 180, borderRadius: 16 }}
        />
      )}

      {/* Header */}
      <View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          {logoUrl && (
            <Image
              source={{ uri: logoUrl }}
              style={{
                width: 56,
                height: 56,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: tokens.colors.borderSubtle,
              }}
            />
          )}
          <View>
            <Typo variant="label" color={tokens.colors.fg2}>{b.slug}</Typo>
            <Typo variant="display2" style={{ marginTop: 4 }}>
              {b.name}
            </Typo>
          </View>
        </View>

        {b.categories.length > 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
            {b.categories.map((c: Category) => (
              <View
                key={c.id}
                style={{
                  paddingVertical: 3,
                  paddingHorizontal: 10,
                  borderRadius: 999,
                  backgroundColor: tokens.colors.actionSubtleBg,
                }}
              >
                <Typo variant="caption" color={tokens.colors.actionSubtleFg}>
                  {c.name}
                </Typo>
              </View>
            ))}
          </View>
        )}

        {b.description && (
          <Typo variant="bodyLg" color={tokens.colors.fg2} style={{ marginTop: 10 }}>
            {b.description}
          </Typo>
        )}
        {b.address && (
          <Typo variant="caption" color={tokens.colors.fg3} style={{ marginTop: 4 }}>
            {b.address}
          </Typo>
        )}

        {b.openingHours && <HoursDisplay hours={b.openingHours} />}
      </View>

      {/* Photo gallery */}
      {b.photos.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {b.photos.map((p: Photo) => {
            const url = r2Url(p.r2Key);
            return url ? (
              <Image
                key={p.id}
                source={{ uri: url }}
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: tokens.colors.borderSubtle,
                }}
              />
            ) : null;
          })}
        </ScrollView>
      )}

      {/* Tabs */}
      <View
        style={{
          flexDirection: 'row',
          borderBottomWidth: 1,
          borderColor: tokens.colors.borderSubtle,
        }}
      >
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

function HoursDisplay({ hours }: { hours: OpeningHours }) {
  const today = (['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as DayKey[])[new Date().getDay()]!;
  return (
    <View style={{ marginTop: 12, gap: 4 }}>
      <Typo variant="label" color={tokens.colors.fg2} style={{ marginBottom: 4 }}>
        Opening hours
      </Typo>
      {DAYS.map(([key, label]) => {
        const d = hours[key];
        const isToday = key === today;
        return (
          <View key={key} style={{ flexDirection: 'row', gap: 12 }}>
            <Typo
              variant="bodySm"
              color={isToday ? tokens.colors.fg1 : tokens.colors.fg3}
              style={{ width: 96, fontWeight: isToday ? '600' : '400' }}
            >
              {label}
            </Typo>
            <Typo
              variant="bodySm"
              color={d.closed ? tokens.colors.danger : isToday ? tokens.colors.fg1 : tokens.colors.fg2}
              style={{ fontWeight: isToday ? '600' : '400' }}
            >
              {d.closed ? 'Closed' : `${d.open} - ${d.close}`}
            </Typo>
          </View>
        );
      })}
    </View>
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
                  {new Intl.NumberFormat(undefined, {
                    style: 'currency',
                    currency: it.currency,
                  }).format(it.priceCents / 100)}
                </Typo>
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}
