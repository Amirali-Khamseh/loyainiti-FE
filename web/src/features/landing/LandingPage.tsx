import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, ResponsiveContainer } from 'recharts';
import {
  QrCode, ScanLine, Gift, Heart, Star, Clock, UtensilsCrossed,
  Users, MapPin, LayoutDashboard, Zap, Sparkles, Store, ArrowRight, Check, Lock,
} from 'lucide-react';
import { Card } from '../../components/Card';
import { LoyaltyStamp } from '../../components/LoyaltyStamp';
import { QrHeroAnimation } from './QrHeroAnimation';

type Step = { icon: React.ReactNode; title: string; body: string };

type Feature = Step & {
  /** Live preview rendered below the text - a real product component, not
   *  just another icon, so each cell has something distinct to look at. */
  visual: React.ReactNode;
  /** Named cell in the section's bento-grid template (see BENTO_AREAS). */
  area: 'a' | 'b' | 'c' | 'd' | 'e' | 'f';
};

// 4-column x 3-row mosaic: one 2x2 hero cell, two 1x2 tall cells, two 1x1
// small cells, and one 2x1 wide cell - a real gallery of differently
// shaped cards instead of a uniform grid.
const BENTO_AREAS = `"a a b c" "a a b c" "d e f f"`;

const miniVisitsData = [
  { d: 'Mon', v: 8 }, { d: 'Tue', v: 14 }, { d: 'Wed', v: 10 }, { d: 'Thu', v: 18 },
  { d: 'Fri', v: 22 }, { d: 'Sat', v: 30 }, { d: 'Sun', v: 26 },
];

/** Decorative preview of the real owner/manager analytics chart (see StatsPage),
 *  with an actual total and per-day figures so it reads as data, not wallpaper. */
function MiniAnalyticsChart() {
  const total = miniVisitsData.reduce((sum, d) => sum + d.v, 0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span className="num-lg">{total}</span>
        <span className="caption" style={{ color: 'var(--success)' }}>▲ 12% vs last week</span>
      </div>
      <div style={{ width: '100%', height: 108 }}>
        <ResponsiveContainer>
          <BarChart data={miniVisitsData} margin={{ top: 18, right: 4, left: 4, bottom: 0 }}>
            <XAxis
              dataKey="d"
              tickLine={false}
              axisLine={false}
              tick={{ fill: 'var(--fg-3)', fontFamily: 'var(--font-mono)', fontSize: 11 }}
            />
            <Bar dataKey="v" fill="var(--action)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/** Decorative preview of staff role assignment - stacked to suit a narrow tall cell. */
function StaffRolesPreview() {
  const people: { initials: string; role: string; color: string }[] = [
    { initials: 'A', role: 'Owner', color: 'var(--action)' },
    { initials: 'M', role: 'Manager', color: 'var(--cyan-500)' },
    { initials: 'S', role: 'Staff', color: 'var(--slate-500)' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {people.map((p) => (
        <div key={p.role} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 28, height: 28, borderRadius: '50%', background: p.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#FFFFFF', font: 'var(--t-caption)', fontWeight: 700, flexShrink: 0,
            }}
          >
            {p.initials}
          </div>
          <span className="caption" style={{ color: 'var(--fg-2)' }}>{p.role}</span>
        </div>
      ))}
    </div>
  );
}

/** Decorative preview of a business's rating, as shown on ExplorePage cards. */
function RatingPreview() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} size={15} fill="var(--cyan-500)" color="var(--cyan-500)" />
      ))}
      <span style={{ font: 'var(--t-body-sm)', fontWeight: 600, color: 'var(--action)' }}>4.8</span>
      <span className="caption" style={{ color: 'var(--fg-3)' }}>(128)</span>
    </div>
  );
}

// Fixed decorative pattern - not a real QR code, just a small echo of the hero.
const qrChipPattern = [
  [1, 0, 1, 1],
  [1, 1, 0, 1],
  [0, 1, 1, 0],
  [1, 0, 1, 1],
];

/** Small static QR-swatch icon for the "digital loyalty card" concept. */
function MiniQrChip() {
  const cell = 12;
  const gap = 2;
  const size = qrChipPattern.length * cell;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      {qrChipPattern.flatMap((row, r) =>
        row.map((on, c) =>
          on ? (
            <rect
              key={`${r}-${c}`}
              x={c * cell}
              y={r * cell}
              width={cell - gap}
              height={cell - gap}
              rx={2}
              fill="var(--cyan-500)"
            />
          ) : null,
        ),
      )}
    </svg>
  );
}

/** Preview of a menu list, for the customer-facing member menu concept. */
function MenuPreview() {
  const items = [
    { name: 'Espresso', price: '€1.80' },
    { name: 'Flat white', price: '€3.20' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {items.map((item) => (
        <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
          <span className="caption" style={{ color: 'var(--fg-2)' }}>{item.name}</span>
          <span className="mono" style={{ fontSize: 12, color: 'var(--fg-3)' }}>{item.price}</span>
        </div>
      ))}
    </div>
  );
}

/** Preview of a favorited shop card, echoing the heart badge on ExplorePage. */
function FavoriteChip() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div
        style={{
          position: 'relative', width: 40, height: 40, borderRadius: 10,
          background: 'var(--bg-muted)', border: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}
      >
        <Store size={18} color="var(--fg-3)" />
        <span
          style={{
            position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%',
            background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Heart size={11} fill="var(--danger)" color="var(--danger)" />
        </span>
      </div>
      <span className="caption" style={{ color: 'var(--fg-2)' }}>Byte Size Café</span>
    </div>
  );
}

/** Countdown chip for a reward with an expiry date. */
function DeadlineBadge() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Clock size={13} color="var(--cyan-500)" />
        <span className="caption" style={{ color: 'var(--fg-2)', fontWeight: 600 }}>12 days left</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: 'var(--border-subtle)', overflow: 'hidden' }}>
        <div style={{ width: '65%', height: '100%', background: 'var(--cyan-500)' }} />
      </div>
    </div>
  );
}

/** Compact summary of a loyalty program's rule, for the business side. */
function ProgramChip() {
  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', gap: 2,
        padding: '10px 12px', borderRadius: 10,
        background: 'var(--bg-muted)', border: '1px solid var(--border-subtle)',
      }}
    >
      <span className="body-sm" style={{ fontWeight: 600, color: '#FFFFFF' }}>Coffee Card</span>
      <span className="caption" style={{ color: 'var(--fg-3)' }}>5 visits → free espresso</span>
    </div>
  );
}

/** Scan-to-logged-visit mini flow, for the staff-scanning concept. */
function ScanFlowChip() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--bg-muted)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <QrCode size={13} color="var(--fg-2)" />
        </div>
        <ArrowRight size={12} color="var(--fg-3)" />
        <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--success-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Check size={13} color="var(--success)" />
        </div>
      </div>
      <span className="caption" style={{ color: 'var(--fg-2)' }}>Visit logged</span>
    </div>
  );
}

/** Public vs. member menu tabs, for the dual-menu concept. */
function MenuTabsChip() {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <span
        style={{
          padding: '4px 10px', borderRadius: 999, font: 'var(--t-caption)',
          background: 'var(--bg-muted)', color: 'var(--fg-2)', border: '1px solid var(--border-subtle)',
        }}
      >
        Public
      </span>
      <span
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '4px 10px', borderRadius: 999, font: 'var(--t-caption)',
          background: 'var(--action-subtle-bg)', color: 'var(--action-subtle-fg)',
        }}
      >
        <Lock size={10} /> Member
      </span>
    </div>
  );
}

/** Geocoded location chip, for the discovery concept. */
/** Small decorative map: a few abstract road lines and a pulsing pin, not a
 *  real tile fetch - just enough to read as "location" at a glance. */
function MiniMapPreview() {
  return (
    <svg width="100%" height="64" viewBox="0 0 260 64" role="img" aria-hidden="true">
      <style>{`
        @keyframes mapPing {
          0% { r: 6; opacity: 0.5; }
          100% { r: 16; opacity: 0; }
        }
      `}</style>
      <rect width="260" height="64" rx="10" fill="var(--bg-muted)" />
      <path d="M-10 46 C 40 20, 90 55, 140 32 S 230 10, 270 28" stroke="var(--border-default)" strokeWidth="2" fill="none" />
      <path d="M10 12 C 55 30, 110 6, 150 22 S 230 34, 270 18" stroke="var(--border-subtle)" strokeWidth="2" fill="none" />
      <circle cx="55" cy="40" r="2.5" fill="var(--fg-3)" />
      <circle cx="190" cy="20" r="2.5" fill="var(--fg-3)" />
      <circle cx="140" cy="30" r="6" fill="none" stroke="var(--action)" strokeWidth="2" style={{ animation: 'mapPing 2s ease-out infinite' }} />
      <circle cx="140" cy="30" r="6" fill="var(--action)" />
    </svg>
  );
}

function LocationChip() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <MiniMapPreview />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <MapPin size={14} color="var(--cyan-500)" />
        <span className="caption" style={{ color: 'var(--fg-2)' }}>Berlin, DE</span>
        <span className="caption" style={{ color: 'var(--fg-3)' }}>· 0.8 km away</span>
      </div>
    </div>
  );
}

const howItWorks: Step[] = [
  {
    icon: <QrCode size={20} color="#FFFFFF" />,
    title: 'Get your QR code',
    body: 'Every account comes with a unique QR code the moment you sign up: it is your loyalty card across the whole network.',
  },
  {
    icon: <ScanLine size={20} color="#FFFFFF" />,
    title: 'Scan in at checkout',
    body: 'Staff scan your code to log the visit. Your progress toward the next reward updates instantly, for both of you to see.',
  },
  {
    icon: <Gift size={20} color="#FFFFFF" />,
    title: 'Redeem your reward',
    body: 'Hit the required visit count and cash in the reward on the spot: no punch cards to lose, no forms to fill in.',
  },
];

const customerFeatures: Feature[] = [
  {
    icon: <Zap size={20} color="#FFFFFF" />,
    title: 'Real-time progress',
    body: 'Every scan updates your visit count and reward eligibility immediately, so you can watch a free reward come into reach.',
    visual: <LoyaltyStamp required={5} earned={3} rewardLabel="Free coffee" />,
    area: 'a',
  },
  {
    icon: <UtensilsCrossed size={20} color="#FFFFFF" />,
    title: 'Member-only menus',
    body: "Join a business's loyalty program to unlock its member menu and pricing, right alongside its public one.",
    visual: <MenuPreview />,
    area: 'b',
  },
  {
    icon: <Heart size={20} color="#FFFFFF" />,
    title: 'Favorite businesses',
    body: "Bookmark the spots you visit most so they're one tap away next time you're deciding where to go.",
    visual: <FavoriteChip />,
    area: 'c',
  },
  {
    icon: <QrCode size={20} color="#FFFFFF" />,
    title: 'A digital loyalty card',
    body: 'One QR code tied to your account, accepted at every participating business, with nothing to print and nothing to lose.',
    visual: <MiniQrChip />,
    area: 'd',
  },
  {
    icon: <Star size={20} color="#FFFFFF" />,
    title: 'Ratings & reviews',
    body: "Rate and review the businesses you've actually visited, and read what other members think before you go.",
    visual: <RatingPreview />,
    area: 'e',
  },
  {
    icon: <Clock size={20} color="#FFFFFF" />,
    title: 'Clear reward deadlines',
    body: 'Programs can carry an expiry date, so you always know exactly how long you have to redeem what you have earned.',
    visual: <DeadlineBadge />,
    area: 'f',
  },
];

const businessFeatures: Feature[] = [
  {
    icon: <LayoutDashboard size={20} color="#FFFFFF" />,
    title: 'Analytics dashboard',
    body: 'Total visits, unique and new customers, redemptions, and your top customers, over any date range you pick.',
    visual: <MiniAnalyticsChart />,
    area: 'a',
  },
  {
    icon: <Users size={20} color="#FFFFFF" />,
    title: 'Owner, manager & staff roles',
    body: 'Invite your team with the right level of access: owners and managers see analytics, staff focus on scanning.',
    visual: <StaffRolesPreview />,
    area: 'b',
  },
  {
    icon: <UtensilsCrossed size={20} color="#FFFFFF" />,
    title: 'Public & member menus',
    body: 'Publish a public menu for anyone to browse, plus a member-only menu with photos and pricing for your program.',
    visual: <MenuTabsChip />,
    area: 'c',
  },
  {
    icon: <Gift size={20} color="#FFFFFF" />,
    title: 'Custom loyalty programs',
    body: 'Set the required visit count and the reward per program, with an optional expiry date on redemptions.',
    visual: <ProgramChip />,
    area: 'd',
  },
  {
    icon: <ScanLine size={20} color="#FFFFFF" />,
    title: 'One-tap staff scanning',
    body: "Staff scan a customer's QR code to log the visit and see reward eligibility on the spot, with no manual lookups.",
    visual: <ScanFlowChip />,
    area: 'e',
  },
  {
    icon: <MapPin size={20} color="#FFFFFF" />,
    title: 'Profile & discovery',
    body: 'Address, hours, and location are geocoded automatically, so customers can find and rate your business by city.',
    visual: <LocationChip />,
    area: 'f',
  },
];

const divider: React.CSSProperties = {
  border: 'none',
  height: 1,
  background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.18), transparent)',
  margin: 0,
};

const ctaPrimary: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  padding: '14px 24px', borderRadius: 10,
  font: 'var(--t-body)', fontWeight: 600, fontSize: 16,
  background: 'var(--action)', color: 'var(--action-fg)',
  textDecoration: 'none', boxShadow: 'var(--shadow-inset)',
};

const ctaGhost: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 8,
  padding: '14px 24px', borderRadius: 10,
  font: 'var(--t-body)', fontWeight: 600, fontSize: 16,
  background: 'transparent', color: '#FFFFFF',
  border: '1px solid var(--border-default)', textDecoration: 'none',
};

/** Gallery-style mosaic: one large hero cell, two tall cells, two small
 *  cells, and one wide cell, laid out via named CSS grid-template-areas
 *  so the six cards read as a deliberate gallery rather than a uniform grid. */
function BentoGrid({ items }: { items: Feature[] }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'repeat(3, minmax(130px, auto))',
        gridTemplateAreas: BENTO_AREAS,
        gap: 16,
      }}
    >
      {items.map((f) => (
        <Card key={f.title} style={{ gridArea: f.area, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'var(--action)', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {f.icon}
          </div>
          <div>
            <p className="body-sm" style={{ fontWeight: 600, color: '#FFFFFF' }}>{f.title}</p>
            <p className="caption" style={{ color: 'var(--fg-2)', marginTop: 4 }}>{f.body}</p>
          </div>
          <div style={{ marginTop: 'auto', paddingTop: 4 }}>{f.visual}</div>
        </Card>
      ))}
    </div>
  );
}

/** Horizontal step timeline: a connecting line runs behind the markers, each
 *  cut through by a canvas-colored ring so the line reads as passing "into"
 *  the marker rather than overlapping it. A glowing segment travels along
 *  the line on a loop so the connection itself feels "active". */
function Timeline({ steps }: { steps: Step[] }) {
  const half = 100 / steps.length / 2;
  return (
    <div style={{ position: 'relative' }}>
      <style>{`
        @keyframes timelineFlow {
          0% { left: -35%; }
          100% { left: 100%; }
        }
      `}</style>
      <div
        style={{
          position: 'absolute', top: 24, left: `${half}%`, right: `${half}%`,
          height: 2, background: 'var(--border-default)', overflow: 'hidden', zIndex: 0,
        }}
      >
        <div
          style={{
            position: 'absolute', top: 0, width: '35%', height: '100%',
            background: 'linear-gradient(to right, transparent, var(--action), var(--cyan-500), transparent)',
            animation: 'timelineFlow 2.6s ease-in-out infinite',
          }}
        />
      </div>
      <div
        style={{
          position: 'relative', zIndex: 1,
          display: 'grid', gridTemplateColumns: `repeat(${steps.length}, 1fr)`, gap: 16,
        }}
      >
        {steps.map((step, i) => (
          <div key={step.title} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 10 }}>
            <div
              style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'var(--action)', border: '4px solid var(--bg-canvas)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'var(--shadow-2)',
              }}
            >
              {step.icon}
            </div>
            <span className="label" style={{ color: 'var(--fg-3)' }}>Step {i + 1}</span>
            <p className="body-sm" style={{ fontWeight: 600, color: '#FFFFFF' }}>{step.title}</p>
            <p className="caption" style={{ color: 'var(--fg-2)', maxWidth: 240 }}>{step.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LandingPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 56 }}>
      {/* ── Hero ── */}
      <header
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 40,
          alignItems: 'center',
        }}
      >
        <div>
          <span className="label">Loyalty network</span>
          <h1 className="display-1" style={{ marginTop: 8 }}>
            One QR code replaces every punch card
          </h1>
          <p className="body-lg" style={{ color: 'var(--fg-2)', maxWidth: 560, marginTop: 12 }}>
            Customers carry a single digital loyalty card. Businesses scan it to track visits,
            run reward programs, and unlock member-only menus, with no app-hopping and no paper cards.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 28 }}>
            <Link to="/sign-up" style={ctaPrimary}>
              <Sparkles size={16} /> Get started
            </Link>
            <Link to="/explore" style={ctaGhost}>
              Explore shops
            </Link>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div
            style={{
              width: 260,
              height: 260,
              padding: 24,
              borderRadius: 20,
              background:
                'radial-gradient(160px 160px at 50% 40%, rgba(34,211,238,0.16), transparent), var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <QrHeroAnimation />
          </div>
        </div>
      </header>

      <hr style={divider} />

      {/* ── How it works ── */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <h2 className="h2">from sign-up to reward, in three scans</h2>
        <Timeline steps={howItWorks} />
      </section>

      <hr style={divider} />

      {/* ── For customers ── */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <span className="label">For customers</span>
        <h2 className="h2">every visit, every reward, in one place</h2>
        <BentoGrid items={customerFeatures} />
      </section>

      <hr style={divider} />

      {/* ── For businesses ── */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <span className="label">For businesses</span>
        <h2 className="h2">run your loyalty program, not your paperwork</h2>
        <BentoGrid items={businessFeatures} />
      </section>

      {/* ── Final CTA ── */}
      <Card
        variant="inverse"
        padding={40}
        style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}
      >
        <h2 className="h2" style={{ color: '#FFFFFF' }}>bring your business onto the network</h2>
        <p className="body" style={{ color: 'rgba(255,255,255,0.85)', maxWidth: 480 }}>
          Set up a loyalty program, publish your menu, and start scanning customers in, all from loyainiti.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/sign-up" style={ctaPrimary}>
            <Sparkles size={16} /> Get started
          </Link>
          <Link to="/explore" style={{ ...ctaGhost, borderColor: 'rgba(255,255,255,0.35)' }}>
            Explore shops
          </Link>
        </div>
      </Card>
    </div>
  );
}
