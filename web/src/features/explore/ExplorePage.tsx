import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Clock, Coffee, MapPin, Search, Star } from 'lucide-react';
import { api } from '../../lib/api';
import { auth } from '../../lib/auth';
import { resolveIcon } from '../../lib/icon';
import { Card } from '../../components/Card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/Select';

type Category = { id: string; name: string; slug: string };

type LocationGroup = { country: string; cities: string[] };

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
  categories: Category[];
  ratingAvg?: number | null;
  ratingCount?: number;
};

type Membership = {
  membershipId: string;
  business: { id: string; slug: string; name: string; logoR2Key?: string | null };
  joinedAt: string;
  totalVisits: number;
  visitsSinceLastRedemption: number;
  program: null | {
    id: string;
    name: string;
    requiredVisits: number;
    rewardDescription: string;
    rewardEligible: boolean;
    expiresAt: string | null;
  };
};

const SHOPS_PER_PAGE = 5;

function fmtDeadline(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function r2Url(key: string | null | undefined): string | null {
  if (!key) return null;
  const base = import.meta.env.VITE_R2_PUBLIC_BASE_URL ?? '';
  if (!base) return null;
  return `${base.replace(/\/$/, '')}/${key}`;
}

export function ExplorePage() {
  const { data: session } = auth.useSession();

  const [searchInput, setSearchInput] = useState('');
  const [searchName, setSearchName] = useState('');
  const [shopsPage, setShopsPage] = useState(0);

  // Location filter. Defaults to the signed-in user's city (once, on first load)
  // so customers see their own city first; empty means "everywhere".
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

      <hr style={divider} />

      {/* ── Browse by category ── */}
      {(mainCategories.data?.length ?? 0) > 0 && (
        <>
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
                      background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div
                      style={{
                        width: 44, height: 44, borderRadius: 10,
                        background: 'var(--action)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      <Icon size={22} color="#FFFFFF" />
                    </div>
                    <div>
                      <p className="body-sm" style={{ fontWeight: 600, color: '#FFFFFF' }}>{cat.name}</p>
                      <p className="caption" style={{ color: '#a1a1aa', marginTop: 2 }}>
                        {cat.childCount} {cat.childCount === 1 ? 'type' : 'types'}
                      </p>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
        <hr style={divider} />
        </>
      )}

      {session && (memberships.data?.length ?? 0) > 0 && (() => {
        const myShops = memberships.data ?? [];
        const totalPages = Math.max(1, Math.ceil(myShops.length / SHOPS_PER_PAGE));
        const page = Math.min(shopsPage, totalPages - 1);
        const start = page * SHOPS_PER_PAGE;
        const visible = myShops.slice(start, start + SHOPS_PER_PAGE);
        return (
        <>
        <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <h2 className="h2">Your shops</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {visible.map((m) => (
              <Link key={m.membershipId} to={`/b/${m.business.slug}`} style={{ textDecoration: 'none' }}>
                <Card>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {r2Url(m.business.logoR2Key) ? (
                      <img
                        src={r2Url(m.business.logoR2Key)!}
                        alt=""
                        style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
                      />
                    ) : (
                      <Coffee size={20} color="var(--action)" />
                    )}
                    <h3 className="h3">{m.business.name}</h3>
                  </div>
                  <p className="body-sm" style={{ marginTop: 8, color: 'var(--fg-2)' }}>
                    {m.totalVisits} visits total
                  </p>
                  {m.program ? (
                    <div style={{ marginTop: 12 }}>
                      <div style={{ height: 8, background: 'var(--slate-200)', borderRadius: 10, overflow: 'hidden' }}>
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
                      {m.program.expiresAt && (
                        <p className="caption" style={{ marginTop: 4, display: 'flex', alignItems: 'center', gap: 4, color: 'var(--fg-3)' }}>
                          <Clock size={12} style={{ flexShrink: 0 }} />
                          Reward ends {fmtDeadline(m.program.expiresAt)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="caption" style={{ marginTop: 12 }}>No active reward programme.</p>
                  )}
                </Card>
              </Link>
            ))}
          </div>
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="caption" style={{ color: 'var(--fg-3)' }}>
                {start + 1}–{Math.min(start + SHOPS_PER_PAGE, myShops.length)} of {myShops.length}
              </span>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" disabled={page === 0} onClick={() => setShopsPage((p) => Math.max(0, p - 1))} style={pagerBtn(page === 0)}>
                  Prev
                </button>
                <button type="button" disabled={page >= totalPages - 1} onClick={() => setShopsPage((p) => p + 1)} style={pagerBtn(page >= totalPages - 1)}>
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
        <hr style={divider} />
        </>
        );
      })()}

      <section id="all-shops" style={{ display: 'flex', flexDirection: 'column', gap: 16, scrollMarginTop: 80 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <h2 className="h2">All shops on the network</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <LocationFilter
              groups={locations.data ?? []}
              country={filterCountry}
              city={filterCity}
              onChange={(c, ci) => { setFilterCountry(c); setFilterCity(ci); }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '8px 12px', minWidth: 220 }}>
              <Search size={15} color="var(--fg-3)" style={{ flexShrink: 0 }} />
              <input
                type="search"
                placeholder="Search shops…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{ border: 'none', outline: 'none', background: 'transparent', font: 'var(--t-body)', color: 'var(--fg-1)', flex: 1, minWidth: 0 }}
              />
            </div>
          </div>
        </div>
        {businesses.isLoading && <p className="body">Loading…</p>}
        {businesses.error && (
          <div style={{ color: 'var(--danger)' }}>
            <p className="body" style={{ fontWeight: 600 }}>Internal Server Error</p>
            <p className="body">Couldn't load businesses. Is the backend running?</p>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {businesses.data?.map((b) => (
            <Link key={b.id} to={`/b/${b.slug}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
              <Card style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                {r2Url(b.coverR2Key) && (
                  <img
                    src={r2Url(b.coverR2Key)!}
                    alt=""
                    style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }}
                  />
                )}
                <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {r2Url(b.logoR2Key) && (
                      <img
                        src={r2Url(b.logoR2Key)!}
                        alt=""
                        style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }}
                      />
                    )}
                    <h3 className="h3">{b.name}</h3>
                  </div>
                  {b.categories.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                      {b.categories.slice(0, 3).map((c) => (
                        <span key={c.id} className="caption" style={{
                          padding: '2px 8px', borderRadius: 10,
                          background: 'transparent', color: 'var(--action)',
                          border: '1px solid rgba(14,165,233,0.35)',
                          fontWeight: 500,
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
                      <span style={{ font: 'var(--t-body-sm)', fontWeight: 600, color: 'var(--action)' }}>
                        {Number(b.ratingAvg).toFixed(1)}
                      </span>
                      <span className="caption" style={{ color: 'var(--fg-3)' }}>
                        ({b.ratingCount})
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
        {businesses.data && businesses.data.length === 0 && (
          <p className="body" style={{ color: 'var(--fg-3)' }}>
            {searchName
              ? `No shops matching "${searchName}"${filterCity ? ` in ${filterCity}` : ''}.`
              : filterCity
                ? `No shops in ${filterCity} yet. Try "All countries" to see everywhere.`
                : 'No published businesses yet.'}
          </p>
        )}
      </section>
    </div>
  );
}

const LOCATION_ALL = '__all__';

/** Country + city dropdowns sourced from the live set of shop locations. */
function LocationFilter({
  groups,
  country,
  city,
  onChange,
}: {
  groups: LocationGroup[];
  country: string;
  city: string;
  onChange: (country: string, city: string) => void;
}) {
  const cities = groups.find((g) => g.country === country)?.cities ?? [];
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <MapPin size={15} color="var(--fg-3)" style={{ flexShrink: 0 }} />
      <Select
        value={country || LOCATION_ALL}
        onValueChange={(v) => onChange(v === LOCATION_ALL ? '' : v, '')}
      >
        <SelectTrigger style={{ minWidth: 150 }}>
          <SelectValue placeholder="All countries" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={LOCATION_ALL}>All countries</SelectItem>
          {groups.map((g) => (
            <SelectItem key={g.country} value={g.country}>
              {g.country}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {country && (
        <Select
          value={city || LOCATION_ALL}
          onValueChange={(v) => onChange(country, v === LOCATION_ALL ? '' : v)}
        >
          <SelectTrigger style={{ minWidth: 140 }}>
            <SelectValue placeholder="All cities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={LOCATION_ALL}>All cities</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}

const divider: React.CSSProperties = {
  border: 'none',
  height: 1,
  background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.18), transparent)',
  margin: 0,
};

function pagerBtn(disabled: boolean): React.CSSProperties {
  return {
    font: 'var(--t-body-sm)',
    padding: '6px 12px',
    borderRadius: 8,
    border: '1px solid var(--border-default)',
    background: 'var(--bg-card)',
    color: disabled ? 'var(--fg-3)' : 'var(--fg-1)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  };
}
