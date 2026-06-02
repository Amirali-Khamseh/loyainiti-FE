import React from 'react';
import { Card } from '../../components/Card';

/** Reviews moderation — ships in Phase 3 alongside the reviews system. */
export function ConsoleReviewsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <header>
        <span className="label">Console</span>
        <h1 className="display-2" style={{ marginTop: 8 }}>Reviews</h1>
        <p className="body-lg" style={{ color: 'var(--fg-2)', marginTop: 8 }}>
          Review moderation will appear here once Phase 3 (reviews &amp; ratings) is implemented.
        </p>
      </header>
      <Card variant="muted">
        <h3 className="h3">Coming in Phase 3</h3>
        <p className="body" style={{ color: 'var(--fg-2)', marginTop: 8 }}>
          You'll be able to hide or restore customer reviews flagged as abusive, and see aggregate
          ratings per business.
        </p>
      </Card>
    </div>
  );
}
