import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Lock } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { auth } from '../../lib/auth';
import { Card } from '../../components/Card';
import { LoyaltyStamp } from '../../components/LoyaltyStamp';

type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
type DayHours = { open: string; close: string; closed: boolean };
type OpeningHours = Record<DayKey, DayHours>;
type Category = { id: string; name: string; slug: string };
type Photo = { id: string; r2Key: string; caption: string | null; sortOrder: number };

const DAYS: [DayKey, string][] = [
  ['mon', 'Monday'], ['tue', 'Tuesday'], ['wed', 'Wednesday'], ['thu', 'Thursday'],
  ['fri', 'Friday'], ['sat', 'Saturday'], ['sun', 'Sunday'],
];

function r2Url(key: string | null | undefined): string | null {
  if (!key) return null;
  const base = import.meta.env.VITE_R2_PUBLIC_BASE_URL ?? '';
  if (!base) return null;
  return `${base.replace(/\/$/, '')}/${key}`;
}

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
  isAvailable: boolean;
  photoR2Key: string | null;
};

type MenuTree = {
  businessId: string;
  businessSlug: string;
  contentVersion: number;
  menu: {
    id: string;
    kind: 'public' | 'member';
    title: string;
    categories: Array<{ id: string; name: string; sortOrder: number; items: MenuItem[] }>;
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
  totalVisits: number;
  visitsSinceLastRedemption: number;
  program: null | { rewardEligible: boolean; requiredVisits: number };
};

function formatPrice(cents: number, currency: string): string {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(cents / 100);
}

type Tab = 'public' | 'member' | 'rewards';

export function ShopPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { data: session } = auth.useSession();
  const [tab, setTab] = useState<Tab>('public');

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
    queryFn: () => api<LoyaltyProgram[]>(`/api/businesses/${business.data!.id}/loyalty-programs`),
    enabled: !!business.data,
  });

  const myMemberships = useQuery({
    queryKey: ['my-memberships'],
    queryFn: () => api<Membership[]>('/api/me/memberships'),
    enabled: !!session,
  });

  const activeProgram = programs.data?.find((p) => p.isActive);
  const membership = myMemberships.data?.find((m) => m.business.id === business.data?.id);
  const isMember = !!membership;
  const memberAccessError = memberMenu.error instanceof ApiError && memberMenu.error.status === 403;

  if (business.isLoading) return <p className="body">Loading…</p>;
  if (business.error) return <p className="body" style={{ color: 'var(--danger)' }}>Shop not found.</p>;

  const b = business.data!;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Cover photo */}
      {r2Url(b.coverR2Key) && (
        <img
          src={r2Url(b.coverR2Key)!}
          alt=""
          style={{ width: '100%', height: 240, objectFit: 'cover', borderRadius: 16 }}
        />
      )}

      <header>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {r2Url(b.logoR2Key) && (
            <img
              src={r2Url(b.logoR2Key)!}
              alt=""
              style={{ width: 56, height: 56, borderRadius: 12, objectFit: 'cover', border: '1px solid var(--border-subtle)' }}
            />
          )}
          <div>
            <span className="label">{b.slug}</span>
            <h1 className="display-2" style={{ marginTop: 4 }}>{b.name}</h1>
          </div>
        </div>
        {b.categories.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10 }}>
            {b.categories.map((c) => (
              <span key={c.id} className="caption" style={{
                padding: '3px 10px', borderRadius: 999,
                background: 'var(--action-subtle-bg)', color: 'var(--action-subtle-fg)',
              }}>
                {c.name}
              </span>
            ))}
          </div>
        )}
        {b.description && (
          <p className="body-lg" style={{ color: 'var(--fg-2)', marginTop: 10, maxWidth: 640 }}>
            {b.description}
          </p>
        )}
        {b.address && <p className="body-sm" style={{ color: 'var(--fg-3)', marginTop: 4 }}>{b.address}</p>}
        {b.openingHours && <HoursDisplay hours={b.openingHours} />}
      </header>

      {/* Photo gallery */}
      {b.photos.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 10 }}>
          {b.photos.map((p) => {
            const url = r2Url(p.r2Key);
            return url ? (
              <img
                key={p.id}
                src={url}
                alt={p.caption ?? ''}
                style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: 12, border: '1px solid var(--border-subtle)' }}
              />
            ) : null;
          })}
        </div>
      )}

      <nav style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border-subtle)' }}>
        {(['public', 'member', 'rewards'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '12px 16px',
              borderBottom: tab === t ? '2px solid var(--action)' : '2px solid transparent',
              color: tab === t ? 'var(--action)' : 'var(--fg-2)',
              font: 'var(--t-body)',
              fontWeight: 600,
              textTransform: 'capitalize',
              cursor: 'pointer',
            }}
          >
            {t === 'member' ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                Member menu {!isMember && <Lock size={14} />}
              </span>
            ) : t === 'rewards' ? (
              'Rewards'
            ) : (
              'Public menu'
            )}
          </button>
        ))}
      </nav>

      {tab === 'public' && (
        <MenuTreeView tree={publicMenu.data} loading={publicMenu.isLoading} />
      )}

      {tab === 'member' && (
        <>
          {!session && (
            <Card>
              <h3 className="h3">Sign in to see the member menu</h3>
              <p className="body" style={{ color: 'var(--fg-2)', marginTop: 8 }}>
                Members get an extended menu and faster service.
              </p>
            </Card>
          )}
          {session && memberAccessError && (
            <Card>
              <h3 className="h3">You're not a member yet</h3>
              <p className="body" style={{ color: 'var(--fg-2)', marginTop: 8 }}>
                Memberships are added the first time the shop scans your QR code. Drop in and say
                hi - your loyalty card starts on visit #1.
              </p>
            </Card>
          )}
          {session && !memberAccessError && (
            <MenuTreeView tree={memberMenu.data} loading={memberMenu.isLoading} />
          )}
        </>
      )}

      {tab === 'rewards' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Card>
            <h3 className="h3">{activeProgram ? activeProgram.name : 'No active reward'}</h3>
            {activeProgram ? (
              <>
                <p className="body" style={{ color: 'var(--fg-2)', marginTop: 8 }}>
                  {activeProgram.rewardDescription}
                </p>
                <p className="caption" style={{ marginTop: 16 }}>
                  Earn {activeProgram.requiredVisits} stamps to unlock.
                </p>
              </>
            ) : (
              <p className="body" style={{ color: 'var(--fg-2)', marginTop: 8 }}>
                {b.name} hasn't set up a loyalty programme yet.
              </p>
            )}
          </Card>
          {activeProgram && membership && (
            <Card>
              <h3 className="h3">Your progress</h3>
              <div style={{ marginTop: 16 }}>
                <LoyaltyStamp
                  required={activeProgram.requiredVisits}
                  earned={membership.visitsSinceLastRedemption}
                  rewardLabel={activeProgram.rewardDescription}
                />
              </div>
            </Card>
          )}
          {activeProgram && !membership && session && (
            <Card>
              <h3 className="h3">Start collecting</h3>
              <p className="body" style={{ color: 'var(--fg-2)', marginTop: 8 }}>
                Show your QR at the till on your first visit to start your card.
              </p>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function MenuTreeView({ tree, loading }: { tree: MenuTree | undefined; loading: boolean }) {
  if (loading) return <p className="body">Loading menu…</p>;
  if (!tree) return <p className="body" style={{ color: 'var(--fg-3)' }}>No menu published.</p>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {tree.menu.categories.map((cat) => (
        <section key={cat.id}>
          <h3 className="h3" style={{ marginBottom: 12 }}>
            {cat.name}
          </h3>
          <div style={{ display: 'grid', gap: 12 }}>
            {cat.items.map((it) => (
              <div
                key={it.id}
                style={{
                  display: 'flex',
                  gap: 16,
                  padding: 16,
                  borderRadius: 12,
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-card)',
                  opacity: it.isAvailable ? 1 : 0.5,
                }}
              >
                <div style={{ flex: 1 }}>
                  <h4 style={{ font: 'var(--t-body-lg)', fontWeight: 600, margin: 0 }}>{it.name}</h4>
                  {it.description && (
                    <p className="body-sm" style={{ color: 'var(--fg-2)', marginTop: 4 }}>
                      {it.description}
                    </p>
                  )}
                </div>
                <span className="num-lg">{formatPrice(it.priceCents, it.currency)}</span>
              </div>
            ))}
            {cat.items.length === 0 && (
              <p className="caption" style={{ color: 'var(--fg-3)' }}>No items in this category.</p>
            )}
          </div>
        </section>
      ))}
      {tree.menu.categories.length === 0 && (
        <p className="body" style={{ color: 'var(--fg-3)' }}>The menu is empty for now.</p>
      )}
    </div>
  );
}

function HoursDisplay({ hours }: { hours: OpeningHours }) {
  const today = (['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as DayKey[])[new Date().getDay()]!;
  return (
    <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 4 }}>
      <p className="label" style={{ marginBottom: 4 }}>Opening hours</p>
      {DAYS.map(([key, label]) => {
        const d = hours[key];
        const isToday = key === today;
        return (
          <div key={key} style={{ display: 'flex', gap: 12 }}>
            <span style={{
              width: 96, font: 'var(--t-body-sm)',
              fontWeight: isToday ? 600 : 400,
              color: isToday ? 'var(--fg-1)' : 'var(--fg-3)',
            }}>
              {label}
            </span>
            <span style={{
              font: 'var(--t-body-sm)',
              color: d.closed ? 'var(--danger)' : (isToday ? 'var(--fg-1)' : 'var(--fg-2)'),
              fontWeight: isToday ? 600 : 400,
            }}>
              {d.closed ? 'Closed' : `${d.open} - ${d.close}`}
            </span>
          </div>
        );
      })}
    </div>
  );
}
