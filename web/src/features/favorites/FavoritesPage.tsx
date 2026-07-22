import React from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Card } from '../../components/Card';
import { useFavorites } from './useFavorites';
import { FavoriteButton } from './FavoriteButton';

function r2Url(key: string | null | undefined): string | null {
  if (!key) return null;
  const base = import.meta.env.VITE_R2_PUBLIC_BASE_URL ?? '';
  if (!base) return null;
  return `${base.replace(/\/$/, '')}/${key}`;
}

export function FavoritesPage() {
  const favorites = useFavorites();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
      <header>
        <span className="label">Saved</span>
        <h1 className="display-2" style={{ marginTop: 8 }}>Your favorites</h1>
        <p className="body-lg" style={{ color: 'var(--fg-2)', marginTop: 8 }}>
          Shops you&rsquo;ve saved. Tap the heart to remove them.
        </p>
      </header>

      {favorites.isLoading && (
        <p className="body" style={{ color: 'var(--fg-3)' }}>Loading…</p>
      )}

      {favorites.data && favorites.data.length === 0 && (
        <p className="body" style={{ color: 'var(--fg-3)' }}>
          No favorites yet. <Link to="/explore">Browse shops</Link> and tap the heart to save them here.
        </p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {favorites.data?.map((f) => (
          <div key={f.businessId} style={{ position: 'relative' }}>
            <Link to={`/b/${f.slug}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
              <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                {r2Url(f.coverR2Key) && (
                  <img
                    src={r2Url(f.coverR2Key)!}
                    alt=""
                    style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }}
                  />
                )}
                <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingRight: 28 }}>
                    {r2Url(f.logoR2Key) && (
                      <img
                        src={r2Url(f.logoR2Key)!}
                        alt=""
                        style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
                      />
                    )}
                    <h3 className="h3">{f.name}</h3>
                  </div>
                  <p className="body-sm" style={{ marginTop: 8, color: 'var(--fg-2)', flex: 1 }}>
                    {f.description ?? 'A new shop in the network.'}
                  </p>
                  {(f.ratingCount ?? 0) > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                      <Star size={13} fill="var(--cyan-500)" color="var(--cyan-500)" />
                      <span style={{ font: 'var(--t-body-sm)', fontWeight: 600, color: 'var(--action)' }}>
                        {Number(f.ratingAvg).toFixed(1)}
                      </span>
                      <span className="caption" style={{ color: 'var(--fg-3)' }}>({f.ratingCount})</span>
                    </div>
                  )}
                </div>
              </Card>
            </Link>
            <FavoriteButton
              businessId={f.businessId}
              style={{ position: 'absolute', top: r2Url(f.coverR2Key) ? 88 : 12, right: 12 }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
