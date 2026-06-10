import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Coffee, Star } from 'lucide-react';
import { api } from '../../lib/api';
import { auth } from '../../lib/auth';
import { resolveIcon } from '../../lib/icon';
import { Card } from '../../components/Card';

type Category = { id: string; name: string; slug: string };

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
  categories: Category[];
  ratingAvg?: number | null;
  ratingCount?: number;
};

type Membership = {
  membershipId: string;
  business: { id: string; slug: string; name: string };
  joinedAt: string;
  totalVisits: number;
  visitsSinceLastRedemption: number;
  program: null | {
    id: string;
    name: string;
    requiredVisits: number;
    rewardDescription: string;
    rewardEligible: boolean;
  };
};

function r2Url(key: string | null | undefined): string | null {
  if (!key) return null;
  const base = import.meta.env.VITE_R2_PUBLIC_BASE_URL ?? '';
  if (!base) return null;
  return `${base.replace(/\/$/, '')}/${key}`;
}

export function ExplorePage() {
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
      <header>
        <span className="label">The Network</span>
        <h1 className="display-2" style={{ marginTop: 8 }}>
          {session ? `Hi ${session.user.name.split(' ')[0]} - ` : ''}explore shops on loyainiti
        </h1>
        <p className="body-lg" style={{ color: 'var(--fg-2)', maxWidth: 640, marginTop: 8 }}>
          One QR code, every coffee. Track your visits, unlock rewards, and discover places that
          take their hospitality seriously.
        </p>
      </header>

      {/* ── Browse by category ── */}
      {(mainCategories.data?.length ?? 0) > 0 && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 className="h2">Browse by category</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            {mainCategories.data?.map((cat) => {
              const Icon = resolveIcon(cat.icon);
              return (
                <Link
                  key={cat.id}
                  to={`/categories/${cat.slug}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Card
                    style={{
                      display: 'flex', flexDirection: 'column', gap: 12,
                      cursor: 'pointer', transition: 'border-color 0.15s',
                    }}
                  >
                    <div
                      style={{
                        width: 44, height: 44, borderRadius: 4,
                        background: '#FFFFFF',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Icon size={22} color="var(--action)" />
                    </div>
                    <div>
                      <p className="body-sm" style={{ fontWeight: 600 }}>{cat.name}</p>
                      <p className="caption" style={{ color: 'var(--fg-3)', marginTop: 2 }}>
                        {cat.childCount} {cat.childCount === 1 ? 'type' : 'types'}
                      </p>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {session && (memberships.data?.length ?? 0) > 0 && (
        <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 className="h2">Your shops</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {memberships.data?.map((m) => (
              <Link key={m.membershipId} to={`/b/${m.business.slug}`} style={{ textDecoration: 'none' }}>
                <Card>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Coffee size={20} color="var(--action)" />
                    <h3 className="h3">{m.business.name}</h3>
                  </div>
                  <p className="body-sm" style={{ marginTop: 8, color: 'var(--fg-2)' }}>
                    {m.totalVisits} visits total
                  </p>
                  {m.program ? (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ height: 8, background: 'var(--slate-200)', borderRadius: 4, overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${Math.min(100, (m.visitsSinceLastRedemption / m.program.requiredVisits) * 100)}%`,
                            height: '100%',
                            background: m.program.rewardEligible ? 'var(--success)' : 'var(--cyan-500)',
                            transition: 'width var(--dur-3) var(--ease-out)',
                          }}
                        />
                      </div>
                      <p className="caption" style={{ marginTop: 6 }}>
                        {m.program.rewardEligible ? (
                          <><Star size={12} style={{ verticalAlign: 'middle' }} /> Reward ready</>
                        ) : (
                          `${m.visitsSinceLastRedemption} / ${m.program.requiredVisits} visits`
                        )}{' '}
                        - {m.program.rewardDescription}
                      </p>
                    </div>
                  ) : (
                    <p className="caption" style={{ marginTop: 12 }}>No active reward programme.</p>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h2 className="h2">All shops on the network</h2>
        {businesses.isLoading && <p className="body">Loading…</p>}
        {businesses.error && (
          <p className="body" style={{ color: 'var(--danger)' }}>
            Couldn't load businesses. Is the backend running?
          </p>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {businesses.data?.map((b) => (
            <Link key={b.id} to={`/b/${b.slug}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
              <Card style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                {r2Url(b.coverR2Key) && (
                  <img
                    src={r2Url(b.coverR2Key)!}
                    alt=""
                    style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 4, marginBottom: 12 }}
                  />
                )}
                <h3 className="h3">{b.name}</h3>
                {b.categories.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                    {b.categories.slice(0, 3).map((c) => (
                      <span key={c.id} className="caption" style={{
                        padding: '2px 8px', borderRadius: 4,
                        background: 'var(--action-subtle-bg)', color: 'var(--action-subtle-fg)',
                        border: '0.5px solid rgba(255,255,255,0.35)',
                      }}>
                        {c.name}
                      </span>
                    ))}
                  </div>
                )}
                <p className="body-sm" style={{ marginTop: 8, color: 'var(--fg-2)', flex: 1 }}>
                  {b.description ?? 'A new shop in the network.'}
                </p>
                {(b.ratingCount ?? 0) > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                    <Star size={13} fill="var(--cyan-500)" color="var(--cyan-500)" />
                    <span style={{ font: 'var(--t-body-sm)', fontWeight: 600, color: '#ffffff' }}>
                      {Number(b.ratingAvg).toFixed(1)}
                    </span>
                    <span className="caption" style={{ color: 'var(--fg-3)' }}>
                      ({b.ratingCount})
                    </span>
                  </div>
                )}
              </Card>
            </Link>
          ))}
        </div>
        {businesses.data && businesses.data.length === 0 && (
          <p className="body" style={{ color: 'var(--fg-3)' }}>
            No published businesses yet.
          </p>
        )}
      </section>
    </div>
  );
}

