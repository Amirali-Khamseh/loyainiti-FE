import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Coffee, Star } from 'lucide-react';
import { api, API_URL } from '../../lib/api';
import { auth } from '../../lib/auth';
import { Card } from '../../components/Card';

type Category = { id: string; name: string; slug: string };

type Business = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  logoR2Key: string | null;
  coverR2Key: string | null;
  categories: Category[];
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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = useQuery({
    queryKey: ['categories'],
    queryFn: () => api<Category[]>('/api/categories'),
  });

  const businesses = useQuery({
    queryKey: ['businesses', activeCategory],
    queryFn: () =>
      api<Business[]>(`/api/businesses${activeCategory ? `?category=${activeCategory}` : ''}`),
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

      {/* Category filter chips */}
      {(categories.data?.length ?? 0) > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveCategory(null)}
            style={chipStyle(activeCategory === null)}
          >
            All
          </button>
          {categories.data?.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.slug === activeCategory ? null : c.slug)}
              style={chipStyle(c.slug === activeCategory)}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {session && (memberships.data?.length ?? 0) > 0 && !activeCategory && (
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
                      <div style={{ height: 8, background: 'var(--paper-200)', borderRadius: 999, overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${Math.min(100, (m.visitsSinceLastRedemption / m.program.requiredVisits) * 100)}%`,
                            height: '100%',
                            background: m.program.rewardEligible ? 'var(--success)' : 'var(--gold-500)',
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
        <h2 className="h2">
          {activeCategory ? `${categories.data?.find(c => c.slug === activeCategory)?.name ?? ''} shops` : 'All shops on the network'}
        </h2>
        {businesses.isLoading && <p className="body">Loading…</p>}
        {businesses.error && (
          <p className="body" style={{ color: 'var(--danger)' }}>
            Couldn't load businesses. Is the backend running?
          </p>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {businesses.data?.map((b) => (
            <Link key={b.id} to={`/b/${b.slug}`} style={{ textDecoration: 'none' }}>
              <Card>
                {r2Url(b.coverR2Key) && (
                  <img
                    src={r2Url(b.coverR2Key)!}
                    alt=""
                    style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 12, marginBottom: 12 }}
                  />
                )}
                <h3 className="h3">{b.name}</h3>
                {b.categories.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                    {b.categories.slice(0, 3).map((c) => (
                      <span key={c.id} className="caption" style={{
                        padding: '2px 8px', borderRadius: 999,
                        background: 'var(--action-subtle-bg)', color: 'var(--action-subtle-fg)',
                      }}>
                        {c.name}
                      </span>
                    ))}
                  </div>
                )}
                <p className="body-sm" style={{ marginTop: 8, color: 'var(--fg-2)' }}>
                  {b.description ?? 'A new shop in the network.'}
                </p>
              </Card>
            </Link>
          ))}
        </div>
        {businesses.data && businesses.data.length === 0 && (
          <p className="body" style={{ color: 'var(--fg-3)' }}>
            No published businesses{activeCategory ? ' in this category' : ''} yet.
          </p>
        )}
      </section>
    </div>
  );
}

function chipStyle(active: boolean): React.CSSProperties {
  return {
    padding: '6px 14px',
    borderRadius: 999,
    border: `1px solid ${active ? 'var(--action)' : 'var(--border-default)'}`,
    background: active ? 'var(--action-subtle-bg)' : 'var(--bg-card)',
    color: active ? 'var(--action-subtle-fg)' : 'var(--fg-2)',
    font: 'var(--t-body-sm)',
    fontWeight: 500,
    cursor: 'pointer',
  };
}
