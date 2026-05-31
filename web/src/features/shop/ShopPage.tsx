import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Lock } from 'lucide-react';
import { api, ApiError } from '../../lib/api';
import { auth } from '../../lib/auth';
import { Card } from '../../components/Card';
import { LoyaltyStamp } from '../../components/LoyaltyStamp';

type Business = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  address: string | null;
  logoR2Key: string | null;
  coverR2Key: string | null;
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
      <header>
        <span className="label">{b.slug}</span>
        <h1 className="display-2" style={{ marginTop: 8 }}>
          {b.name}
        </h1>
        {b.description && (
          <p className="body-lg" style={{ color: 'var(--fg-2)', marginTop: 8, maxWidth: 640 }}>
            {b.description}
          </p>
        )}
        {b.address && <p className="body-sm" style={{ color: 'var(--fg-3)', marginTop: 4 }}>{b.address}</p>}
      </header>

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
