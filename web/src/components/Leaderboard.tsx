import React from 'react';
import { Card } from './Card';

type Row = {
  id: string;
  name: string;
  detail?: string;
  value: number | string;
};

export function Leaderboard({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <Card>
      <h3 className="h3" style={{ marginBottom: 12 }}>
        {title}
      </h3>
      {rows.length === 0 ? (
        <p className="caption">No data for the selected period.</p>
      ) : (
        <ol style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
          {rows.map((row, idx) => {
            // The #1 row is highlighted with a light cyan background, so its text
            // must use dark colors for contrast (the rest of the list is light
            // text on the dark canvas).
            const top = idx === 0;
            return (
              <li
                key={row.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '8px 12px',
                  borderRadius: 10,
                  background: top ? 'var(--cyan-50)' : 'transparent',
                }}
              >
                <span
                  className="num"
                  style={{
                    width: 24,
                    textAlign: 'right',
                    color: top ? 'var(--slate-600)' : 'var(--fg-3)',
                  }}
                >
                  {idx + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ font: 'var(--t-body)', margin: 0, color: top ? 'var(--navy-800)' : 'var(--fg-1)' }}>
                    {row.name}
                  </p>
                  {row.detail && (
                    <p style={{ font: 'var(--t-caption)', margin: 0, color: top ? 'var(--slate-600)' : 'var(--fg-3)' }}>
                      {row.detail}
                    </p>
                  )}
                </div>
                <span className="num-lg" style={{ color: top ? 'var(--navy-800)' : undefined }}>
                  {row.value}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}
