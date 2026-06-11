import React from 'react';
import { ScrollView, View, Pressable, Image } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Coffee, ChevronRight } from 'lucide-react-native';
import { api } from '../../src/lib/api';
import { auth } from '../../src/lib/auth';
import { r2Url } from '../../src/lib/media';
import { resolveIcon } from '../../src/lib/icon';
import { Card } from '../../src/components/Card';
import { Typo } from '../../src/components/Heading';
import { tokens } from '../../src/design-system/tokens';

type MainCategory = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sortOrder: number;
  childCount: number;
};
type Business = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logoR2Key: string | null;
  coverR2Key: string | null;
  ratingAvg?: number | null;
  ratingCount?: number;
  categories: { id: string; name: string; slug: string }[];
};
type Membership = {
  membershipId: string;
  business: { id: string; slug: string; name: string; logoR2Key?: string | null; coverR2Key?: string | null };
  totalVisits: number;
  visitsSinceLastRedemption: number;
  program: null | {
    requiredVisits: number;
    rewardDescription: string;
    rewardEligible: boolean;
  };
};

export default function Explore() {
  const router = useRouter();
  const { data: session } = auth.useSession();

  const mainCategories = useQuery({
    queryKey: ['categories-main'],
    queryFn: () => api<MainCategory[]>('/api/categories/main'),
  });
  const businesses = useQuery({
    queryKey: ['businesses'],
    queryFn: () => api<Business[]>('/api/businesses'),
  });
  const memberships = useQuery({
    queryKey: ['my-memberships'],
    queryFn: () => api<Membership[]>('/api/me/memberships'),
    enabled: !!session,
  });

  return (
    <ScrollView
      style={{ backgroundColor: tokens.colors.bgCanvas }}
      contentContainerStyle={{ padding: 20, gap: 24 }}
    >
      <View>
        <Typo variant="label" color={tokens.colors.fg2}>
          The Network
        </Typo>
        <Typo variant="display2" style={{ marginTop: 8 }}>
          Hi {session?.user?.name?.split(' ')[0] ?? 'there'}
        </Typo>
        <Typo variant="bodyLg" color={tokens.colors.fg2} style={{ marginTop: 8 }}>
          One QR code, every coffee.
        </Typo>
      </View>

      {/* Browse by category - main-category cards in a 2-col grid */}
      <View>
        <Typo variant="h2" style={{ marginBottom: 12 }}>
          Browse by category
        </Typo>
        {mainCategories.isLoading && (
          <Typo variant="body" color={tokens.colors.fg3}>
            Loading categories…
          </Typo>
        )}
        {mainCategories.error && (
          <Typo variant="body" color={tokens.colors.danger}>
            Couldn't load categories: {(mainCategories.error as Error).message}
          </Typo>
        )}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {mainCategories.data?.map((cat: MainCategory) => {
            const Icon = resolveIcon(cat.icon);
            return (
              <Pressable
                key={cat.id}
                onPress={() =>
                  // Cast: Expo Router's generated route types don't include the
                  // new categories/[mainSlug] route until the dev server
                  // regenerates them on next start.
                  router.push(`/(customer)/categories/${cat.slug}` as never)
                }
                style={{ width: '47%' }}
              >
                <Card padding={16} style={{ backgroundColor: '#FFFFFF', borderColor: 'rgba(5,38,152,0.1)' }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 4,
                      backgroundColor: tokens.colors.action,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon color="#FFFFFF" size={22} />
                  </View>
                  <Typo variant="h3" style={{ marginTop: 12, color: '#052698' }}>
                    {cat.name}
                  </Typo>
                  <Typo variant="caption" color="#878EA0" style={{ marginTop: 2 }}>
                    {cat.childCount} {cat.childCount === 1 ? 'type' : 'types'}
                  </Typo>
                </Card>
              </Pressable>
            );
          })}
        </View>
      </View>

      {session && (memberships.data?.length ?? 0) > 0 && (
        <View>
          <Typo variant="h2" style={{ marginBottom: 12 }}>
            Your shops
          </Typo>
          <View style={{ gap: 12 }}>
            {memberships.data?.map((m: Membership) => (
              <Pressable
                key={m.membershipId}
                onPress={() => router.push(`/(customer)/shop/${m.business.slug}` as const)}
              >
                <Card>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    {r2Url(m.business.logoR2Key) ? (
                      <Image
                        source={{ uri: r2Url(m.business.logoR2Key)! }}
                        style={{ width: 36, height: 36, borderRadius: 6 }}
                      />
                    ) : (
                      <Coffee color={tokens.colors.action} size={20} />
                    )}
                    <Typo variant="h3">{m.business.name}</Typo>
                  </View>
                  <Typo variant="bodySm" color={tokens.colors.fg2} style={{ marginTop: 6 }}>
                    {m.totalVisits} visits total
                  </Typo>
                  {m.program && (
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
                            width: `${Math.min(
                              100,
                              (m.visitsSinceLastRedemption / m.program.requiredVisits) * 100,
                            )}%`,
                            height: '100%',
                            backgroundColor: m.program.rewardEligible
                              ? tokens.colors.success
                              : tokens.colors.cyan500,
                          }}
                        />
                      </View>
                      <Typo variant="caption" color={tokens.colors.fg2} style={{ marginTop: 6 }}>
                        {m.program.rewardEligible
                          ? 'Reward ready!'
                          : `${m.visitsSinceLastRedemption} / ${m.program.requiredVisits} - ${m.program.rewardDescription}`}
                      </Typo>
                    </View>
                  )}
                </Card>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {/* All shops */}
      <View>
        <Typo variant="h2" style={{ marginBottom: 12 }}>
          All shops
        </Typo>
        <View style={{ gap: 12 }}>
          {businesses.isLoading && (
            <Typo variant="body" color={tokens.colors.fg3}>
              Loading shops…
            </Typo>
          )}
          {businesses.error && (
            <Typo variant="body" color={tokens.colors.danger}>
              Couldn't load shops: {(businesses.error as Error).message}
            </Typo>
          )}
          {businesses.data?.map((b: Business) => {
            const coverUrl = r2Url(b.coverR2Key);
            return (
              <Pressable
                key={b.id}
                onPress={() => router.push(`/(customer)/shop/${b.slug}` as const)}
              >
                <Card>
                  {coverUrl && (
                    <Image
                      source={{ uri: coverUrl }}
                      style={{ width: '100%', height: 120, borderRadius: 4, marginBottom: 12 }}
                    />
                  )}
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Typo variant="h3">{b.name}</Typo>
                    <ChevronRight color={tokens.colors.fg3} size={18} />
                  </View>
                  <Typo variant="bodySm" color={tokens.colors.fg2} style={{ marginTop: 6 }}>
                    {b.description ?? 'A new shop in the network.'}
                  </Typo>
                </Card>
              </Pressable>
            );
          })}
          {businesses.data?.length === 0 && (
            <Typo variant="body" color={tokens.colors.fg3}>
              No published shops yet.
            </Typo>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
