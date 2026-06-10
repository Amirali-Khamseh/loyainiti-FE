import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Star } from 'lucide-react';
import { api } from '../../lib/api';
import { r2Url } from '../../lib/media';
import { resolveIcon } from '../../lib/icon';
import { Card } from '../../components/Card';

type MainCategory = {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  childCount: number;
};

type SubCategory = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
};

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

export function CategoryPage() {
  const { mainSlug = '' } = useParams<{ mainSlug: string }>();
  const [activeSub, setActiveSub] = useState<string | null>(null);

  const mains = useQuery({
    queryKey: ['categories-main'],
    queryFn: () => api<MainCategory[]>('/api/categories/main'),
  });
  const main = mains.data?.find((m) => m.slug === mainSlug);

  const children = useQuery({
    queryKey: ['categories-children', mainSlug],
    queryFn: () => api<SubCategory[]>(`/api/categories/main/${mainSlug}/children`),
    enabled: !!mainSlug,
  });

  // null activeSub → filter by the main slug (BE expands to all children)
  const filterSlug = activeSub ?? mainSlug;
  const businesses = useQuery({
    queryKey: ['businesses', filterSlug],
    queryFn: () => api<Business[]>(`/api/businesses?category=${filterSlug}`),
    enabled: !!filterSlug,
  });

  const Icon = resolveIcon(main?.icon);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

      {/* ── Back nav ── */}
      <Link
        to="/"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          color: 'var(--fg-3)', textDecoration: 'none',
          font: 'var(--t-body-sm)', width: 'fit-content',
          transition: 'color 0.15s',
        }}
      >
        <ChevronLeft size={15} /> Back to explore
      </Link>

      {/* ── Category header ── */}
      <header style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            width: 52, height: 52, borderRadius: 4, flexShrink: 0,
            background: '#FFFFFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Icon size={26} color="var(--action)" />
        </div>
        <div>
          <span className="label" style={{ color: 'var(--fg-3)' }}>Category</span>
          <h1 className="display-2" style={{ marginTop: 2 }}>
            {main?.name ?? '…'}
          </h1>
          {main && (
            <p className="caption" style={{ color: 'var(--fg-3)', marginTop: 2 }}>
              {main.childCount} {main.childCount === 1 ? 'type' : 'types'}
            </p>
          )}
        </div>
      </header>

      {/* ── Sub-category chips ── */}
      {(children.data?.length ?? 0) > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={() => setActiveSub(null)} style={chipStyle(activeSub === null)}>
            All
          </button>
          {children.data?.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveSub(c.slug === activeSub ? null : c.slug)}
              style={chipStyle(c.slug === activeSub)}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {/* ── Business grid ── */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {businesses.isLoading && <p className="body" style={{ color: 'var(--fg-3)' }}>Loading…</p>}
        {businesses.error && (
          <p className="body" style={{ color: 'var(--danger)' }}>
            Couldn't load businesses. Is the backend running?
          </p>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {businesses.data?.map((b) => (
            <Link
              key={b.id}
              to={`/b/${b.slug}`}
              style={{ textDecoration: 'none', display: 'block', height: '100%' }}
            >
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
                      <span
                        key={c.id}
                        className="caption"
                        style={{
                          padding: '2px 8px', borderRadius: 4,
                          background: 'var(--action-subtle-bg)', color: 'var(--action-subtle-fg)',
                          border: '0.5px solid rgba(255,255,255,0.35)',
                        }}
                      >
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

        {businesses.data?.length === 0 && !businesses.isLoading && (
          <p className="body" style={{ color: 'var(--fg-3)' }}>
            No published shops in this category yet.
          </p>
        )}
      </section>
    </div>
  );
}

function chipStyle(active: boolean): React.CSSProperties {
  return {
    padding: '6px 14px',
    borderRadius: 4,
    border: `1px solid ${active ? 'var(--action)' : 'var(--border-default)'}`,
    background: active ? 'var(--action-subtle-bg)' : 'var(--bg-card)',
    color: active ? 'var(--action-subtle-fg)' : 'var(--fg-2)',
    font: 'var(--t-body-sm)',
    fontWeight: 500,
    cursor: 'pointer',
  };
}
