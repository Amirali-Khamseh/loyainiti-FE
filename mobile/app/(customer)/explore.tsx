import React, { useEffect, useState } from 'react';
import { ScrollView, View, Pressable, Image } from 'react-native';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Coffee, ChevronRight, Clock } from 'lucide-react-native';
import { api } from '../../src/lib/api';
import { auth } from '../../src/lib/auth';
import { r2Url } from '../../src/lib/media';
import { resolveIcon } from '../../src/lib/icon';
import { Card } from '../../src/components/Card';
import { Skeleton, SkeletonCard } from '../../src/components/Skeleton';
import { Input } from '../../src/components/Input';
import { SelectField } from '../../src/components/SelectField';
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
  country?: string | null;
  city?: string | null;
  logoR2Key: string | null;
  coverR2Key: string | null;
  ratingAvg?: number | null;
  ratingCount?: number;
  categories: { id: string; name: string; slug: string }[];
};
type LocationGroup = { country: string; cities: string[] };
type Membership = {
  membershipId: string;
  business: { id: string; slug: string; name: string; logoR2Key?: string | null; coverR2Key?: string | null };
  totalVisits: number;
  visitsSinceLastRedemption: number;
  program: null | {
    requiredVisits: number;
    rewardDescription: string;
    rewardEligible: boolean;
    expiresAt: string | null;
  };
};

const SHOPS_PER_PAGE = 5;
const ALL_LOCATIONS = '__all__';

function fmtDeadline(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function Explore() {
  const router = useRouter();
  const { data: session } = auth.useSession();

  const [searchInput, setSearchInput] = useState('');
  const [searchName, setSearchName] = useState('');
  const [shopsPage, setShopsPage] = useState(0);

  // Location filter. Defaults once to the signed-in user's city so customers see
  // their own city first; empty values mean "everywhere".
  const [filterCountry, setFilterCountry] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [locationDefaulted, setLocationDefaulted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSearchName(searchInput.trim()), 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const locations = useQuery({
    queryKey: ['business-locations'],
    queryFn: () => api<LocationGroup[]>('/api/businesses/locations'),
  });

  useEffect(() => {
    if (locationDefaulted) return;
    const u = session?.user as { country?: string | null; city?: string | null } | undefined;
    if (u?.city) {
      setFilterCountry(u.country ?? '');
      setFilterCity(u.city);
      setLocationDefaulted(true);
    }
  }, [session, locationDefaulted]);

  const mainCategories = useQuery({
    queryKey: ['categories-main'],
    queryFn: () => api<MainCategory[]>('/api/categories/main'),
  });
  const businesses = useQuery({
    queryKey: ['businesses', searchName, filterCountry, filterCity],
    queryFn: () =>
      api<Business[]>('/api/businesses', {
        query: {
          name: searchName || undefined,
          country: filterCountry || undefined,
          city: filterCity || undefined,
        },
      }),
    placeholderData: keepPreviousData,
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
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {Array.from({ length: 4 }, (_, i) => (
              <View key={i} style={{ width: '47%' }}>
                <Card padding={16}>
                  <Skeleton width={44} height={44} radius={tokens.radius.md} />
                  <Skeleton width="70%" height={18} style={{ marginTop: 12 }} />
                  <Skeleton width="40%" height={12} style={{ marginTop: 6 }} />
                </Card>
              </View>
            ))}
          </View>
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
                <Card padding={16}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: tokens.radius.md,
                      backgroundColor: tokens.colors.action,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon color={tokens.colors.fg1} size={22} />
                  </View>
                  <Typo variant="h3" style={{ marginTop: 12 }}>
                    {cat.name}
                  </Typo>
                  <Typo variant="caption" color={tokens.colors.fg3} style={{ marginTop: 2 }}>
                    {cat.childCount} {cat.childCount === 1 ? 'type' : 'types'}
                  </Typo>
                </Card>
              </Pressable>
            );
          })}
        </View>
      </View>

      {session && (memberships.data?.length ?? 0) > 0 && (() => {
        const myShops = memberships.data ?? [];
        const totalPages = Math.max(1, Math.ceil(myShops.length / SHOPS_PER_PAGE));
        const page = Math.min(shopsPage, totalPages - 1);
        const start = page * SHOPS_PER_PAGE;
        const visible = myShops.slice(start, start + SHOPS_PER_PAGE);
        return (
        <View>
          <Typo variant="h2" style={{ marginBottom: 12 }}>
            Your shops
          </Typo>
          <View style={{ gap: 12 }}>
            {visible.map((m: Membership) => (
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
                      {m.program.expiresAt && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                          <Clock color={tokens.colors.fg3} size={12} />
                          <Typo variant="caption" color={tokens.colors.fg3}>
                            Reward ends {fmtDeadline(m.program.expiresAt)}
                          </Typo>
                        </View>
                      )}
                    </View>
                  )}
                </Card>
              </Pressable>
            ))}
          </View>
          {totalPages > 1 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
              <Typo variant="caption" color={tokens.colors.fg3}>
                {start + 1}–{Math.min(start + SHOPS_PER_PAGE, myShops.length)} of {myShops.length}
              </Typo>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <Pressable
                  disabled={page === 0}
                  onPress={() => setShopsPage((p) => Math.max(0, p - 1))}
                  style={pagerBtnStyle(page === 0)}
                >
                  <Typo variant="bodySm" color={page === 0 ? tokens.colors.fg3 : tokens.colors.fg1}>Prev</Typo>
                </Pressable>
                <Pressable
                  disabled={page >= totalPages - 1}
                  onPress={() => setShopsPage((p) => p + 1)}
                  style={pagerBtnStyle(page >= totalPages - 1)}
                >
                  <Typo variant="bodySm" color={page >= totalPages - 1 ? tokens.colors.fg3 : tokens.colors.fg1}>Next</Typo>
                </Pressable>
              </View>
            </View>
          )}
        </View>
        );
      })()}

      {/* All shops */}
      <View>
        <Typo variant="h2" style={{ marginBottom: 12 }}>
          All shops on the network
        </Typo>
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 12 }}>
          <SelectField
            value={filterCountry || ALL_LOCATIONS}
            options={[
              { label: 'All countries', value: ALL_LOCATIONS },
              ...(locations.data ?? []).map((g) => ({ label: g.country, value: g.country })),
            ]}
            onChange={(v) => {
              setFilterCountry(v === ALL_LOCATIONS ? '' : v);
              setFilterCity('');
            }}
            containerStyle={{ flex: 1 }}
          />
          {filterCountry !== '' && (
            <SelectField
              value={filterCity || ALL_LOCATIONS}
              options={[
                { label: 'All cities', value: ALL_LOCATIONS },
                ...((locations.data ?? []).find((g) => g.country === filterCountry)?.cities ?? []).map((c) => ({
                  label: c,
                  value: c,
                })),
              ]}
              onChange={(v) => setFilterCity(v === ALL_LOCATIONS ? '' : v)}
              containerStyle={{ flex: 1 }}
            />
          )}
        </View>
        <Input
          placeholder="Search shops…"
          value={searchInput}
          onChangeText={setSearchInput}
          containerStyle={{ marginBottom: 12 }}
        />
        <View style={{ gap: 12 }}>
          {businesses.isLoading &&
            Array.from({ length: 3 }, (_, i) => <SkeletonCard key={i} />)}
          {businesses.error && (
            <View>
              <Typo variant="body" color={tokens.colors.danger} style={{ fontWeight: '600' }}>
                Internal Server Error
              </Typo>
              <Typo variant="body" color={tokens.colors.danger}>
                Couldn't load businesses. Is the backend running?
              </Typo>
            </View>
          )}
          {businesses.data?.map((b: Business) => {
            const coverUrl = r2Url(b.coverR2Key);
            return (
              <Pressable
                key={b.id}
                onPress={() => router.push(`/(customer)/shop/${b.slug}` as const)}
              >
                <Card padding={0} style={{ overflow: 'hidden' }}>
                  {coverUrl && (
                    <Image
                      source={{ uri: coverUrl }}
                      style={{ width: '100%', height: 120 }}
                    />
                  )}
                  <View style={{ padding: 20 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                        {r2Url(b.logoR2Key) ? (
                          <Image
                            source={{ uri: r2Url(b.logoR2Key)! }}
                            style={{ width: 32, height: 32, borderRadius: 6 }}
                          />
                        ) : null}
                        <Typo variant="h3" style={{ flex: 1 }}>{b.name}</Typo>
                      </View>
                      <ChevronRight color={tokens.colors.fg3} size={18} />
                    </View>
                    <Typo variant="bodySm" color={tokens.colors.fg2} style={{ marginTop: 6 }}>
                      {b.description ?? 'A new shop in the network.'}
                    </Typo>
                  </View>
                </Card>
              </Pressable>
            );
          })}
          {businesses.data?.length === 0 && (
            <Typo variant="body" color={tokens.colors.fg3}>
              {searchName
                ? `No shops matching "${searchName}"${filterCity ? ` in ${filterCity}` : ''}.`
                : filterCity
                  ? `No shops in ${filterCity} yet. Pick "All countries" to see everywhere.`
                  : 'No published shops yet.'}
            </Typo>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

function pagerBtnStyle(disabled: boolean) {
  return {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tokens.colors.borderDefault,
    backgroundColor: tokens.colors.bgCard,
    opacity: disabled ? 0.5 : 1,
  };
}
