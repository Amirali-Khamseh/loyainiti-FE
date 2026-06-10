/**
 * Category drill-down. Reached from an Explore main-category card.
 *
 * Shows the main category's sub-categories as filter chips ("All" +
 * each sub). Selecting "All" lists every business in the main category
 * (BE expands the main slug to all its children); selecting a sub chip
 * narrows to that sub. Tapping a shop opens its detail page.
 */
import React, { useState } from 'react';
import { ScrollView, View, Pressable, Image } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Star, ChevronRight } from 'lucide-react-native';
import { api } from '../../../src/lib/api';
import { resolveIcon } from '../../../src/lib/icon';
import { r2Url } from '../../../src/lib/media';
import { Card } from '../../../src/components/Card';
import { Typo } from '../../../src/components/Heading';
import { tokens } from '../../../src/design-system/tokens';

type Category = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  icon: string | null;
  sortOrder: number;
};
type MainCategory = Category & { childCount: number };
type Business = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  coverR2Key: string | null;
  ratingAvg?: number | null;
  ratingCount?: number;
  categories: { id: string; name: string; slug: string }[];
};

export default function CategoryDrillDown() {
  const router = useRouter();
  const { mainSlug = '' } = useLocalSearchParams<{ mainSlug: string }>();
  // null = show the whole main category; otherwise a specific sub slug.
  const [activeSub, setActiveSub] = useState<string | null>(null);

  // Resolve the main category (for title + icon) from the main list.
  const mains = useQuery({
    queryKey: ['categories-main'],
    queryFn: () => api<MainCategory[]>('/api/categories/main'),
  });
  const main = mains.data?.find((m: MainCategory) => m.slug === mainSlug);

  const children = useQuery({
    queryKey: ['categories-children', mainSlug],
    queryFn: () => api<Category[]>(`/api/categories/main/${mainSlug}/children`),
  });

  // Filter slug: a specific sub, or the main itself (BE expands main -> children).
  const filterSlug = activeSub ?? mainSlug;
  const businesses = useQuery({
    queryKey: ['businesses', filterSlug],
    queryFn: () => api<Business[]>(`/api/businesses?category=${filterSlug}`),
  });

  const Icon = resolveIcon(main?.icon);

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: main?.name ?? 'Category' }} />
      <ScrollView
        style={{ backgroundColor: tokens.colors.bgCanvas }}
        contentContainerStyle={{ padding: 20, gap: 20 }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View
            style={{
              width: 48,
              height: 48,
              borderRadius: 4,
              backgroundColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon color={tokens.colors.action} size={24} />
          </View>
          <Typo variant="display2">{main?.name ?? 'Category'}</Typo>
        </View>

        {/* Sub-category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
        >
          <Chip label="All" active={activeSub === null} onPress={() => setActiveSub(null)} />
          {children.data?.map((c: Category) => (
            <Chip
              key={c.id}
              label={c.name}
              active={c.slug === activeSub}
              onPress={() => setActiveSub(c.slug === activeSub ? null : c.slug)}
            />
          ))}
        </ScrollView>

        {/* Shop list */}
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
                  <View
                    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                  >
                    <Typo variant="h3">{b.name}</Typo>
                    <ChevronRight color={tokens.colors.fg3} size={18} />
                  </View>
                  {b.categories.length > 0 && (
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                      {b.categories.slice(0, 3).map((c) => (
                        <View
                          key={c.id}
                          style={{
                            paddingVertical: 2,
                            paddingHorizontal: 8,
                            borderRadius: 4,
                            backgroundColor: '#FFFFFF',
                          }}
                        >
                          <Typo variant="caption" color={tokens.colors.action} style={{ fontWeight: '500' }}>
                            {c.name}
                          </Typo>
                        </View>
                      ))}
                    </View>
                  )}
                  <Typo variant="bodySm" color={tokens.colors.fg2} style={{ marginTop: 8 }}>
                    {b.description ?? 'A new shop in the network.'}
                  </Typo>
                  {(b.ratingCount ?? 0) > 0 && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
                      <Star size={13} color={tokens.colors.cyan500} fill={tokens.colors.cyan500} />
                      <Typo variant="bodySm" style={{ fontWeight: '600' }}>
                        {Number(b.ratingAvg).toFixed(1)}
                      </Typo>
                      <Typo variant="caption" color={tokens.colors.fg3}>
                        ({b.ratingCount})
                      </Typo>
                    </View>
                  )}
                </Card>
              </Pressable>
            );
          })}
          {businesses.data?.length === 0 && !businesses.isLoading && (
            <Typo variant="body" color={tokens.colors.fg3}>
              No shops here yet.
            </Typo>
          )}
        </View>
      </ScrollView>
    </>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 6,
        paddingHorizontal: 14,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: active ? tokens.colors.action : tokens.colors.borderDefault,
        backgroundColor: active ? tokens.colors.actionSubtleBg : tokens.colors.bgCard,
      }}
    >
      <Typo
        variant="bodySm"
        color={active ? tokens.colors.actionSubtleFg : tokens.colors.fg2}
        style={{ fontWeight: '500' }}
      >
        {label}
      </Typo>
    </Pressable>
  );
}
