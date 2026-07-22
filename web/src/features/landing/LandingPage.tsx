import React from 'react';
import { Link } from 'react-router-dom';
import {
  QrCode, ScanLine, Gift, Heart, Star, Clock, UtensilsCrossed,
  Users, MapPin, LayoutDashboard, Zap, Sparkles,
} from 'lucide-react';
import { Card } from '../../components/Card';
import { QrHeroAnimation } from './QrHeroAnimation';

type Feature = { icon: React.ReactNode; title: string; body: string };

const howItWorks: Feature[] = [
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
    icon: <QrCode size={20} color="#FFFFFF" />,
    title: 'A digital loyalty card',
    body: 'One QR code tied to your account, accepted at every participating business, with nothing to print and nothing to lose.',
  },
  {
    icon: <Zap size={20} color="#FFFFFF" />,
    title: 'Real-time progress',
    body: 'Every scan updates your visit count and reward eligibility immediately, so you can watch a free reward come into reach.',
  },
  {
    icon: <UtensilsCrossed size={20} color="#FFFFFF" />,
    title: 'Member-only menus',
    body: "Join a business's loyalty program to unlock its member menu and pricing, right alongside its public one.",
  },
  {
    icon: <Heart size={20} color="#FFFFFF" />,
    title: 'Favorite businesses',
    body: "Bookmark the spots you visit most so they're one tap away next time you're deciding where to go.",
  },
  {
    icon: <Star size={20} color="#FFFFFF" />,
    title: 'Ratings & reviews',
    body: "Rate and review the businesses you've actually visited, and read what other members think before you go.",
  },
  {
    icon: <Clock size={20} color="#FFFFFF" />,
    title: 'Clear reward deadlines',
    body: 'Programs can carry an expiry date, so you always know exactly how long you have to redeem what you have earned.',
  },
];

const businessFeatures: Feature[] = [
  {
    icon: <Gift size={20} color="#FFFFFF" />,
    title: 'Custom loyalty programs',
    body: 'Set the required visit count and the reward per program, with an optional expiry date on redemptions.',
  },
  {
    icon: <ScanLine size={20} color="#FFFFFF" />,
    title: 'One-tap staff scanning',
    body: "Staff scan a customer's QR code to log the visit and see reward eligibility on the spot, with no manual lookups.",
  },
  {
    icon: <Users size={20} color="#FFFFFF" />,
    title: 'Owner, manager & staff roles',
    body: 'Invite your team with the right level of access: owners and managers see analytics, staff focus on scanning.',
  },
  {
    icon: <UtensilsCrossed size={20} color="#FFFFFF" />,
    title: 'Public & member menus',
    body: 'Publish a public menu for anyone to browse, plus a member-only menu with photos and pricing for your program.',
  },
  {
    icon: <MapPin size={20} color="#FFFFFF" />,
    title: 'Profile & discovery',
    body: 'Address, hours, and location are geocoded automatically, so customers can find and rate your business by city.',
  },
  {
    icon: <LayoutDashboard size={20} color="#FFFFFF" />,
    title: 'Analytics dashboard',
    body: 'Total visits, unique and new customers, redemptions, and your top customers, over any date range you pick.',
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

function FeatureGrid({ items }: { items: Feature[] }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
      {items.map((f) => (
        <Card key={f.title} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div
            style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'var(--action)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {f.icon}
          </div>
          <div>
            <p className="body-sm" style={{ fontWeight: 600, color: '#FFFFFF' }}>{f.title}</p>
            <p className="caption" style={{ color: 'var(--fg-2)', marginTop: 4 }}>{f.body}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}

/** Horizontal step timeline: a connecting line runs behind the markers, each
 *  cut through by a canvas-colored ring so the line reads as passing "into"
 *  the marker rather than overlapping it. */
function Timeline({ steps }: { steps: Feature[] }) {
  const half = 100 / steps.length / 2;
  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          position: 'absolute', top: 24, left: `${half}%`, right: `${half}%`,
          height: 2, background: 'var(--border-default)', zIndex: 0,
        }}
      />
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
        <FeatureGrid items={customerFeatures} />
      </section>

      <hr style={divider} />

      {/* ── For businesses ── */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <span className="label">For businesses</span>
        <h2 className="h2">run your loyalty program, not your paperwork</h2>
        <FeatureGrid items={businessFeatures} />
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
