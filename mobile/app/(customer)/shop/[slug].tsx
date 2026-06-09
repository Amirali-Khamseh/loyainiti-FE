import React, { useState } from 'react';
import { ScrollView, View, Pressable, Image, TextInput, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams } from 'expo-router';
import { Lock, Star } from 'lucide-react-native';
import { api, ApiError } from '../../../src/lib/api';
import { auth } from '../../../src/lib/auth';
import { r2Url } from '../../../src/lib/media';
import { Card } from '../../../src/components/Card';
import { Typo } from '../../../src/components/Heading';
import { LoyaltyStamp } from '../../../src/components/LoyaltyStamp';
import { StarRating } from '../../../src/components/StarRating';
import { Button } from '../../../src/components/Button';
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

type ReviewImage = { id: string; r2Key: string; sortOrder: number };
type Review = {
  id: string;
  customerUserId: string;
  customerName: string;
  rating: number;
  comment: string | null;
  isHidden: boolean;
  images: ReviewImage[];
  createdAt: string;
  isOwn: boolean;
};
type ReviewsData = { ratingAvg: number | null; ratingCount: number; reviews: Review[] };

type Tab = 'public' | 'member' | 'rewards' | 'reviews';

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
  const reviewsQuery = useQuery({
    queryKey: ['reviews', slug],
    queryFn: () => api<ReviewsData>(`/api/b/${slug}/reviews`),
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
          style={{ width: '100%', height: 180, borderRadius: 4 }}
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
                borderRadius: 4,
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
                  borderRadius: 4,
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
                  borderRadius: 4,
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
        {(['public', 'member', 'rewards', 'reviews'] as Tab[]).map((t) => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={{
              paddingVertical: 12,
              paddingHorizontal: 12,
              borderBottomWidth: tab === t ? 2 : 0,
              borderColor: tokens.colors.action,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              {t === 'reviews' && (
                <Star
                  size={13}
                  color={tab === t ? tokens.colors.action : tokens.colors.fg2}
                />
              )}
              <Typo variant="body" color={tab === t ? tokens.colors.action : tokens.colors.fg2}>
                {t === 'public'
                  ? 'Public'
                  : t === 'member'
                    ? 'Member'
                    : t === 'rewards'
                      ? 'Rewards'
                      : 'Reviews'}
              </Typo>
              {t === 'reviews' && (reviewsQuery.data?.ratingCount ?? 0) > 0 && (
                <Typo variant="bodySm" color={tokens.colors.fg3}>
                  ({reviewsQuery.data?.ratingAvg?.toFixed(1)})
                </Typo>
              )}
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

      {tab === 'reviews' && (
        <ReviewsTab
          slug={slug}
          data={reviewsQuery.data}
          loading={reviewsQuery.isLoading}
          session={session}
          hasMembership={!!membership}
        />
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

/* ── Reviews tab ───────────────────────────────────────────────────── */

function ReviewsTab({
  slug,
  data,
  loading,
  session,
  hasMembership,
}: {
  slug: string;
  data: ReviewsData | undefined;
  loading: boolean;
  session: { user: { id: string } } | null | undefined;
  hasMembership: boolean;
}) {
  const qc = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState('');

  const invalidate = () => qc.invalidateQueries({ queryKey: ['reviews', slug] });

  const ownReview = data?.reviews.find((r: Review) => r.isOwn);

  const createMut = useMutation({
    mutationFn: () =>
      api(`/api/b/${slug}/reviews`, {
        method: 'POST',
        body: { rating, comment: comment.trim() || undefined },
      }),
    onSuccess: () => {
      setRating(0);
      setComment('');
      invalidate();
      Alert.alert('Posted', 'Thanks for the review!');
    },
    onError: (e) =>
      Alert.alert('Could not post', e instanceof ApiError ? e.message : String(e)),
  });

  const updateMut = useMutation({
    mutationFn: (id: string) =>
      api(`/api/reviews/${id}`, {
        method: 'PATCH',
        body: { rating: editRating, comment: editComment.trim() || null },
      }),
    onSuccess: () => {
      setEditId(null);
      invalidate();
    },
    onError: (e) =>
      Alert.alert('Could not update', e instanceof ApiError ? e.message : String(e)),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => api(`/api/reviews/${id}`, { method: 'DELETE' }),
    onSuccess: () => invalidate(),
    onError: (e) =>
      Alert.alert('Could not delete', e instanceof ApiError ? e.message : String(e)),
  });

  if (loading) {
    return (
      <Typo variant="body" color={tokens.colors.fg3}>
        Loading reviews…
      </Typo>
    );
  }

  return (
    <View style={{ gap: 20 }}>
      {/* Aggregate */}
      {(data?.ratingCount ?? 0) > 0 && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Typo variant="numLg" style={{ fontSize: 36 }}>
            {data!.ratingAvg?.toFixed(1)}
          </Typo>
          <View>
            <StarRating value={Math.round(data!.ratingAvg ?? 0)} size={18} />
            <Typo variant="caption" color={tokens.colors.fg3} style={{ marginTop: 4 }}>
              {data!.ratingCount} review{data!.ratingCount !== 1 ? 's' : ''}
            </Typo>
          </View>
        </View>
      )}

      {/* Write own review */}
      {session && hasMembership && !ownReview && (
        <Card style={{ gap: 10 }}>
          <Typo variant="h3">Leave a review</Typo>
          <StarRating value={rating} onChange={setRating} />
          <TextInput
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={3}
            placeholder="Share your experience…"
            placeholderTextColor={tokens.colors.fg3}
            style={{
              padding: 10,
              borderRadius: 4,
              borderWidth: 1,
              borderColor: tokens.colors.borderDefault,
              backgroundColor: tokens.colors.bgCard,
              color: tokens.colors.fg1,
              fontFamily: tokens.fonts.body,
              minHeight: 80,
              textAlignVertical: 'top',
            }}
          />
          <Button
            onPress={() => createMut.mutate()}
            disabled={rating === 0}
            loading={createMut.isPending}
          >
            Post review
          </Button>
        </Card>
      )}

      {session && !hasMembership && (
        <Card variant="muted">
          <Typo variant="body" color={tokens.colors.fg2}>
            Visit this business and get scanned first to leave a review.
          </Typo>
        </Card>
      )}

      {/* List */}
      {(data?.reviews ?? []).length === 0 ? (
        <Typo variant="body" color={tokens.colors.fg3}>
          No reviews yet - be the first!
        </Typo>
      ) : (
        <View style={{ gap: 12 }}>
          {(data?.reviews ?? []).map((r: Review) => (
            <Card key={r.id}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: 10,
                }}
              >
                <View>
                  <Typo variant="body" style={{ fontWeight: '600' }}>
                    {r.customerName}
                  </Typo>
                  <Typo variant="caption" color={tokens.colors.fg3}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </Typo>
                </View>
                {editId === r.id ? (
                  <StarRating value={editRating} onChange={setEditRating} size={18} />
                ) : (
                  <StarRating value={r.rating} size={18} />
                )}
              </View>

              {editId === r.id ? (
                <View style={{ marginTop: 10, gap: 8 }}>
                  <TextInput
                    value={editComment}
                    onChangeText={setEditComment}
                    multiline
                    numberOfLines={3}
                    style={{
                      padding: 10,
                      borderRadius: 4,
                      borderWidth: 1,
                      borderColor: tokens.colors.borderDefault,
                      backgroundColor: tokens.colors.bgCard,
                      color: tokens.colors.fg1,
                      fontFamily: tokens.fonts.body,
                      minHeight: 70,
                      textAlignVertical: 'top',
                    }}
                  />
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <Button
                      size="sm"
                      onPress={() => updateMut.mutate(r.id)}
                      loading={updateMut.isPending}
                      disabled={editRating === 0}
                    >
                      Save
                    </Button>
                    <Button size="sm" variant="ghost" onPress={() => setEditId(null)}>
                      Cancel
                    </Button>
                  </View>
                </View>
              ) : (
                <>
                  {r.comment && (
                    <Typo variant="body" color={tokens.colors.fg2} style={{ marginTop: 10 }}>
                      {r.comment}
                    </Typo>
                  )}
                  {r.isOwn && (
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onPress={() => {
                          setEditId(r.id);
                          setEditRating(r.rating);
                          setEditComment(r.comment ?? '');
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        loading={deleteMut.isPending}
                        onPress={() =>
                          Alert.alert('Delete review?', 'This cannot be undone.', [
                            { text: 'Cancel', style: 'cancel' },
                            {
                              text: 'Delete',
                              style: 'destructive',
                              onPress: () => deleteMut.mutate(r.id),
                            },
                          ])
                        }
                      >
                        Delete
                      </Button>
                    </View>
                  )}
                </>
              )}
            </Card>
          ))}
        </View>
      )}
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
