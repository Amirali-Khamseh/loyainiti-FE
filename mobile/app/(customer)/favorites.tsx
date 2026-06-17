import React from 'react';
import { ScrollView, View, Pressable, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart } from 'lucide-react-native';
import { useFavorites, useFavoriteToggle } from '../../src/lib/useFavorites';
import { r2Url } from '../../src/lib/media';
import { Card } from '../../src/components/Card';
import { Typo } from '../../src/components/Heading';
import { tokens } from '../../src/design-system/tokens';

export default function Favorites() {
  const router = useRouter();
  const favorites = useFavorites();
  const { toggle, isPending } = useFavoriteToggle();

  return (
    <ScrollView
      style={{ backgroundColor: tokens.colors.bgCanvas }}
      contentContainerStyle={{ padding: 20, gap: 20 }}
    >
      <View>
        <Typo variant="label" color={tokens.colors.fg2}>Saved</Typo>
        <Typo variant="display2" style={{ marginTop: 8 }}>Your favorites</Typo>
        <Typo variant="bodyLg" color={tokens.colors.fg2} style={{ marginTop: 8 }}>
          Shops you&apos;ve saved. Tap the heart to remove them.
        </Typo>
      </View>

      {favorites.isLoading && (
        <Typo variant="body" color={tokens.colors.fg3}>Loading…</Typo>
      )}

      {favorites.data && favorites.data.length === 0 && (
        <Typo variant="body" color={tokens.colors.fg3}>
          No favorites yet. Browse shops and tap the heart icon to save them here.
        </Typo>
      )}

      <View style={{ gap: 12 }}>
        {favorites.data?.map((f) => {
          const coverUrl = r2Url(f.coverR2Key);
          const logoUrl = r2Url(f.logoR2Key);
          return (
            <Pressable
              key={f.businessId}
              onPress={() => router.push(`/(customer)/shop/${f.slug}` as const)}
            >
              <Card padding={0} style={{ overflow: 'hidden' }}>
                {coverUrl && (
                  <Image source={{ uri: coverUrl }} style={{ width: '100%', height: 120 }} />
                )}
                <View style={{ padding: 20 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
                      {logoUrl && (
                        <Image source={{ uri: logoUrl }} style={{ width: 32, height: 32, borderRadius: 6 }} />
                      )}
                      <Typo variant="h3" style={{ flex: 1 }}>{f.name}</Typo>
                    </View>
                    {/* Unfavorite button */}
                    <Pressable
                      onPress={(e) => { e.stopPropagation(); toggle(f.businessId, true); }}
                      disabled={isPending}
                      hitSlop={8}
                      style={{ padding: 4 }}
                    >
                      <Heart size={20} color={tokens.colors.action} fill={tokens.colors.action} strokeWidth={2} />
                    </Pressable>
                  </View>
                  <Typo variant="bodySm" color={tokens.colors.fg2} style={{ marginTop: 6 }}>
                    {f.description ?? 'A new shop in the network.'}
                  </Typo>
                </View>
              </Card>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}
