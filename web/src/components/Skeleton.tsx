import React from 'react';

/**
 * Loading-state placeholders. The shimmer animation lives in styles/app.css
 * (`.skeleton`); these components just lay out the blocks. Use `Skeleton` for a
 * single bar/box and the composites below to mirror real content while it loads.
 */

type SkeletonProps = {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  style?: React.CSSProperties;
};

export function Skeleton({ width = '100%', height = 14, radius = 6, style }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className="skeleton"
      style={{ display: 'block', width, height, borderRadius: radius, ...style }}
    />
  );
}

type SkeletonTextProps = {
  lines?: number;
  lineHeight?: number;
  lastWidth?: number | string;
  gap?: number;
  style?: React.CSSProperties;
};

/** A stack of bars approximating a paragraph; the last line is shortened. */
export function SkeletonText({
  lines = 3,
  lineHeight = 12,
  lastWidth = '60%',
  gap = 8,
  style,
}: SkeletonTextProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap, ...style }}>
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} height={lineHeight} width={i === lines - 1 ? lastWidth : '100%'} />
      ))}
    </div>
  );
}

/** Mirrors the explore business card (cover, logo + title, a few text lines). */
export function SkeletonCard() {
  return (
    <div
      style={{
        borderRadius: 10,
        border: '1px solid var(--border-subtle)',
        background: 'var(--bg-card)',
        overflow: 'hidden',
      }}
    >
      <Skeleton height={120} radius={0} />
      <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Skeleton width={32} height={32} radius={6} />
          <Skeleton width="55%" height={18} />
        </div>
        <SkeletonText lines={2} lastWidth="80%" />
      </div>
    </div>
  );
}

/** A responsive grid of `SkeletonCard`s matching the explore shop grid. */
export function SkeletonCardGrid({ count = 6, minWidth = 280 }: { count?: number; minWidth?: number }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}px, 1fr))`,
        gap: 16,
      }}
    >
      {Array.from({ length: count }, (_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
